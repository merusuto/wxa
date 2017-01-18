import { getElementPolygonPointsString, ELEMENT_COLORS } from '../../utils/svg';
import { calcModeValues } from '../../utils/calc';
import '../../utils/polyfill';

Page({
  data: {
    BASE_DATA_URL: 'https://git.oschina.net/merusuto/data/raw/master',
    windowHeight: 0,
    scrollToTop: false,
    activeMenu: [],
    page: 0,
    perPage: 50,
    totalPage: 0,
    levelMode: 0,
    sortMode: 'rare',
    filters: {}
  },

  prepareData(raw) {
    if (typeof raw === 'string') raw = JSON.parse(raw.trim());
    raw = raw.map(row => {
      const { atk, life, type, rare, aspd, anum } = row;
      const atks = calcModeValues(atk, type, rare);

      return Object.assign(row, {
        elementPath: encodeURI(getElementPolygonPointsString(row, 80, 20)),
        elementColor: encodeURI(ELEMENT_COLORS[row.element - 1]),
        titleString: `${row.title} ${row.name}`,
        rareString: '★'.repeat(rare),
        atks: atks,
        lives: calcModeValues(life, type, rare),
        dpses: atks.map(atk => Math.round(atk / aspd)),
        mdpses: atks.map(atk => Math.round(atk / aspd * anum)),
        fireString: row.fire && (Math.round(row.fire * 100) + '%'),
        aquaString: row.aqua && (Math.round(row.aqua * 100) + '%'),
        windString: row.wind && (Math.round(row.wind * 100) + '%'),
        lightString: row.light && (Math.round(row.light * 100) + '%'),
        darkString: row.dark && (Math.round(row.dark * 100) + '%')
      });
    });

    const countries = [];
    raw.forEach(row => {
      if (row.country && countries.indexOf(row.country) < 0) {
        countries.push(row.country);
      }
    });
    this.setData({ countries });

    this.rawData = raw;
    this.filterData();
    this.sortData();
    this.prepareVisibleData();
    wx.hideNavigationBarLoading();
  },

  prepareVisibleData(page = 0, reset = true) {
    if (!reset && page < this.data.page) {
      this.setData({
        scrollToTop: page > 10
      });
      return;
    }

    this.filterData();
    this.sortData();

    const { perPage } = this.data;
    const data = this.filteredData;
    const totalPage = data.length;
    if (page < 0) page = 0;
    if (page + perPage > totalPage) page = totalPage - perPage;


    this.setData({
      scrollToTop: page > 10,
      visible: data.slice(0, page + perPage),
      page,
      totalPage
    });
  },

  filterData() {
    const { filters, search } = this.data;

    this.filteredData = this.rawData.filter(row => {
      for (const key in filters) {
        const filter = filters[key];
        const value = row[key];

        if (filter == null) {
          continue;
        } else if (filter.indexOf(',') > -1) {
          const inclusion = filter.split(',').map(n => parseInt(n));
          if (inclusion.indexOf(value) < 0) return false;
          else continue;
        } else if (filter.indexOf('-') > -1) {
          const range = filter.split('-').map(parseInt);
          if (value < range[0] || value > range[1]) return false;
          else continue;
        } else if (/\d+/.test(filter)) {
          if (parseInt(filter) !== value) return false;
          else continue;
        } else {
          if (filter !== value) return false;
          else continue;
        }
      }

      if (search && row.title.indexOf(search) < 0 && row.name.indexOf(search) < 0) {
        return false;
      }

      return true;
    });
  },

  sortData() {
    const matches = /([+-]?)(.*)/.exec(this.data.sortMode);
    const sign = matches[1] === '-' ? -1 : 1;
    const attr = matches[2];

    this.filteredData.sort((a, b) => {
      const MODE_VALUE_MAP = {
        atk: 'atks',
        life: 'lives',
        dps: 'dpses',
        mdps: 'mdpses'
      }
      const getValue = (obj, attr) => MODE_VALUE_MAP[attr] ? obj[MODE_VALUE_MAP[attr]][this.data.levelMode] : obj[attr];

      const aValue = getValue(a, attr), bValue = getValue(b, attr);
      return aValue > bValue ? -sign : (aValue < bValue ? sign : (a.id - b.id));
    });
  },

  openSearchBar() {
    this.setData({ activeSearchBar: true });
  },

  closeSearchBar(event) {
    this.setData({ activeSearchBar: false, search: false });
    this.prepareVisibleData();
  },

  popMenu() {
    const { activeMenu } = this.data;
    const poppedMenuItem = activeMenu.pop();
    this.setData({ activeMenu });
  },

  closeModal() {
    this.setData({ active: false });
  },

  scrollToTop() {
    this.setData({ scrollIntoView: 'table-view-header' });
  },

  resetFilters(event) {
    this.setData({ filters: {}, activeMenu: [] });
    this.prepareVisibleData();
  },

  setSearch(event) {
    this.setData({ search: event.detail.value });
    this.prepareVisibleData();
  },

  setFilter(event) {
    const key = event.currentTarget.dataset.key;
    const value = event.currentTarget.dataset.value;

    let { filters } = this.data;
    filters = Object.assign(filters, { [key]: value });

    this.setData({ filters, activeMenu: [] });
    this.prepareVisibleData();
  },

  setLevelMode(event) {
    const levelMode = parseInt(event.currentTarget.dataset.value);
    this.setData({ levelMode, activeMenu: [] });
    this.prepareVisibleData();
  },

  setSortMode(event) {
    const sortMode = event.currentTarget.dataset.value;
    this.setData({ sortMode, activeMenu: [] });
    this.prepareVisibleData();
  },

  onMenuItemClick(event) {
    const activeMenu = JSON.parse(event.currentTarget.dataset.menu);
    if (activeMenu.length === 1 && activeMenu[0] === this.data.activeMenu[0]) {
      this.popMenu();
    } else {
      this.setData({ activeMenu })
    }
  },

  onSwiperChange(event) {
    this.setData({ activeSwiper: event.detail.current });
  },

  onItemClick(event) {
    const activeId = Number.parseInt(event.currentTarget.id);
    const active = this.filteredData.find(item => item.id == activeId)
    this.setData({ active, activeSwiper: 0 });
  },

  onScroll(event) {
    this.prepareVisibleData(Math.floor(event.detail.scrollTop / 100), false);
  },

  onLoad(options) {
    wx.showNavigationBarLoading();
    wx.getSystemInfo({
      success: res => this.setData({ windowHeight: res.windowHeight })
    });
    wx.request({
      url: `${this.data.BASE_DATA_URL}/units.json`,
      method: 'GET',
      dataType: 'json',
      success: res => this.prepareData(res.data)
    });
  }
});
