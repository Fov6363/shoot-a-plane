// src/utils/storage.js

const STORAGE_KEY = 'shoot-a-plane-save';

export class StorageManager {
  /**
   * 获取存档数据
   */
  static load() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : this.getDefaultData();
    } catch (e) {
      console.error('Failed to load save data:', e);
      return this.getDefaultData();
    }
  }

  /**
   * 保存数据
   */
  static save(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error('Failed to save data:', e);
      return false;
    }
  }

  /**
   * 更新最高分
   */
  static updateHighScore(score) {
    const data = this.load();
    if (score > data.highScore) {
      data.highScore = score;
      data.lastPlayed = Date.now();
      this.save(data);
      return true;
    }
    return false;
  }

  /**
   * 增加游戏次数
   */
  static incrementGamesPlayed() {
    const data = this.load();
    data.gamesPlayed++;
    data.lastPlayed = Date.now();
    this.save(data);
  }

  /**
   * 默认数据
   */
  static getDefaultData() {
    return {
      highScore: 0,
      gamesPlayed: 0,
      lastPlayed: null,
    };
  }

  /**
   * 清除所有数据
   */
  static clear() {
    localStorage.removeItem(STORAGE_KEY);
  }
}
