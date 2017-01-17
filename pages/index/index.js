import { getElementPolygonPointsString, ELEMENT_COLORS } from '../../utils/svg';
import { calcModeValues } from '../../utils/calc';
import '../../utils/polyfill';

Page({
  data: {
    windowHeight: 0,
    scrollToTop: false,
    page: 0,
    perPage: 50,
    totalPage: 0,
    mode: 0
  },

  prepareData(raw) {
    if (typeof raw === 'string') raw = JSON.parse(raw.trim());
    raw = raw.map((row) => {
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

    this.rawData = raw;
    this.filteredData = raw;
    this.prepareVisibleData();
    wx.hideNavigationBarLoading();
  },

  prepareVisibleData(page = 0) {
    const { perPage } = this.data;
    const data = this.filteredData;
    const totalPage = data.length;

    if (page < this.data.page) {
      this.setData({
        scrollToTop: page > 10
      });
      return;
    }

    if (page < 0) page = 0;
    if (page + perPage > totalPage) page = totalPage - perPage;

    this.setData({
      scrollToTop: page > 10,
      visible: data.slice(0, page + perPage),
      page,
      totalPage
    });
  },

  closeModal(event) {
    this.setData({ active: false });
  },

  scrollToTop(event) {
    this.setData({ scrollIntoView: 'table-view-header' });
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
    this.prepareVisibleData(Math.floor(event.detail.scrollTop / 100));
  },

  onLoad(options) {
    wx.showNavigationBarLoading();
    wx.getSystemInfo({
      success: res => this.setData({ windowHeight: res.windowHeight })
    });
    wx.request({
      url: 'https://rhym997.oschina.io/merusuto/data/units.json',
      method: 'GET',
      dataType: 'json',
      success: res => this.prepareData(res.data)
    });
  }
});
