import type { GameMode, ScenarioItem, UserAnswer } from './types';
import { GAME_DATA } from './gameData';
import { DELIVERY_ITEM_ID, evaluateDeliveryAction } from './sms/deliveryModel';
import type { DeliveryInvestigation } from './sms/deliveryModel';

declare const Tone: any;

export class GameEngine {
  public currentMode: GameMode = 'mail';
  public currentRound: number = 1;
  public score: number = 0;
  public lives: number = 3;
  public activeItemId: number | null = null;
  public evaluatedItemIds: Set<number> = new Set();
  public userAnswers: UserAnswer[] = [];

  constructor() {}

  public setMode(mode: GameMode) {
    this.currentMode = mode;
  }

  public resetGame() {
    this.currentRound = 1;
    this.score = 0;
    this.lives = 3;
    this.activeItemId = null;
    this.evaluatedItemIds.clear();
    this.userAnswers = [];
  }

  public getCurrentRoundItems(): ScenarioItem[] {
    const allModeItems = GAME_DATA[this.currentMode] || [];
    return allModeItems.filter(item => item.round === this.currentRound);
  }

  public getItemById(id: number): ScenarioItem | undefined {
    return GAME_DATA[this.currentMode].find(item => item.id === id);
  }

  public evaluateAnswer(itemId: number, userChoiceIsScam: boolean): { isCorrect: boolean; item: ScenarioItem } {
    const item = this.getItemById(itemId)!;
    const isCorrect = (userChoiceIsScam === item.isScam);

    if (isCorrect) {
      this.score++;
      this.playSound('correct');
    } else {
      this.lives--;
      this.playSound('wrong');
    }

    this.evaluatedItemIds.add(itemId);
    this.userAnswers.push({
      item,
      userChoiceIsScam,
      isCorrect
    });

    return { isCorrect, item };
  }

  public isRoundComplete(): boolean {
    const roundItems = this.getCurrentRoundItems();
    return roundItems.every(item => this.evaluatedItemIds.has(item.id));
  }

  public evaluateSmsDeliveryAction(action: string, investigation: DeliveryInvestigation): UserAnswer | null {
    if (this.currentMode !== 'messages' || this.lives <= 0 ||
      this.activeItemId !== DELIVERY_ITEM_ID || this.evaluatedItemIds.has(DELIVERY_ITEM_ID)) return null;
    const item = this.getCurrentRoundItems().find(item => item.id === DELIVERY_ITEM_ID);
    const result = evaluateDeliveryAction(action, investigation);
    if (!item || !result) return null;

    this.score += result.scoreDelta;
    this.lives -= result.livesLost;
    const answer: UserAnswer = {
      item, userChoiceIsScam: result.action !== 'pay',
      isCorrect: result.outcome === 'verified', smsAction: result,
    };
    this.evaluatedItemIds.add(item.id);
    this.userAnswers.push(answer);
    if (result.outcome !== 'cautious') this.playSound(result.outcome === 'verified' ? 'correct' : 'wrong');
    return answer;
  }

  public playSound(type: 'correct' | 'wrong') {
    try {
      const synth = new Tone.Synth().toDestination();
      if (type === 'correct') {
        synth.triggerAttackRelease("C5", "8n");
      } else {
        synth.triggerAttackRelease("G2", "8n");
      }
    } catch (e) {
      // Audio fallback
    }
  }
}
