// src/systems/GoldSystem.js

export class GoldSystem {
  constructor(scene) {
    this.scene = scene;

    this.gold = 0;
    this.goldMultiplier = 1.0;
    this.luckyGoldChance = 0; // 获得双倍金币的概率
  }

  /**
   * 添加金币
   */
  addGold(amount) {
    let actual = Math.floor(amount * this.goldMultiplier);

    // 幸运金币：概率双倍
    if (this.luckyGoldChance > 0 && Math.random() < this.luckyGoldChance) {
      actual *= 2;
    }

    this.gold += actual;
    this.scene.events.emit('gold-changed', this.gold);
    return actual;
  }

  /**
   * 消费金币
   */
  spendGold(amount) {
    if (this.gold < amount) return false;
    this.gold -= amount;
    this.scene.events.emit('gold-changed', this.gold);
    return true;
  }

  /**
   * 是否足够
   */
  canAfford(amount) {
    return this.gold >= amount;
  }

  /**
   * 设置金币倍率（金币磁铁）
   */
  setGoldMultiplier(multiplier) {
    this.goldMultiplier = multiplier;
  }

  /**
   * 设置幸运金币概率
   */
  setLuckyGoldChance(chance) {
    this.luckyGoldChance = chance;
  }

  /**
   * 获取当前金币
   */
  getGold() {
    return this.gold;
  }
}
