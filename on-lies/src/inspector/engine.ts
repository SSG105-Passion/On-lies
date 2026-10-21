import type { CaseFile, CaseResult, ClueCat, Rule } from './types';
import { CASES } from './cases';
import { RULES } from './rules';
import { CLUE_CATEGORIES } from './types';

declare const Tone: any;

export class InspectorEngine {
  public day: number = 1;
  public salary: number = 0;
  public citations: number = 0;
  public correctCount: number = 0;
  public totalProcessed: number = 0;

  public queue: CaseFile[] = [];
  public currentCaseIndex: number = 0;
  public timeRemaining: number = 120;
  public isRunning: boolean = false;

  public flaggedIndices: Set<number> = new Set();
  public isCaseEvaluated: boolean = false;
  public currentResult: CaseResult | null = null;

  public categoryTally: Record<ClueCat, [number, number]> = {
    sender: [0, 0],
    urgent: [0, 0],
    ask: [0, 0],
    link: [0, 0],
    bait: [0, 0],
    fake: [0, 0]
  };

  constructor() {}

  public newGame() {
    this.day = 1;
    this.salary = 0;
    this.citations = 0;
    this.correctCount = 0;
    this.totalProcessed = 0;
    this.categoryTally = {
      sender: [0, 0],
      urgent: [0, 0],
      ask: [0, 0],
      link: [0, 0],
      bait: [0, 0],
      fake: [0, 0]
    };
    this.startDay(1);
  }

  public startDay(dayNumber: number) {
    this.day = dayNumber;
    this.citations = 0;
    const dayCases = CASES.filter(c => c.day === this.day);
    this.queue = this.shuffle([...dayCases]);
    this.currentCaseIndex = 0;
    this.timeRemaining = Math.max(60, this.queue.length * 40);
    this.isRunning = false;
    this.resetCurrentCaseState();
  }

  public resetCurrentCaseState() {
    this.flaggedIndices.clear();
    this.isCaseEvaluated = false;
    this.currentResult = null;
  }

  public getCurrentCase(): CaseFile | undefined {
    return this.queue[this.currentCaseIndex];
  }

  public toggleFlag(index: number) {
    if (this.isCaseEvaluated) return;
    if (this.flaggedIndices.has(index)) {
      this.flaggedIndices.delete(index);
    } else {
      this.flaggedIndices.add(index);
    }
    this.playSound('click');
  }

  public stamp(userRejected: boolean): { result: CaseResult; needReason?: boolean } {
    const currentCase = this.getCurrentCase();
    if (!currentCase || this.isCaseEvaluated) {
      throw new Error('Không thể đóng dấu vào lúc này');
    }

    // Nếu từ chối (báo lừa đảo) thì phải có ít nhất 1 chi tiết đánh dấu làm lý do
    if (userRejected && this.flaggedIndices.size === 0) {
      return {
        result: null as any,
        needReason: true
      };
    }

    this.playStampSound(userRejected);

    const isScam = currentCase.isScam;
    const isCorrect = userRejected === isScam;

    // Phân tích các chi tiết đánh dấu
    const wrongFlags = [...this.flaggedIndices].filter(i => !currentCase.allItems[i].clue);
    const detectedClues = currentCase.clueIndices.filter(i => this.flaggedIndices.has(i));
    const isPerfect = isCorrect && isScam && detectedClues.length === currentCase.clueIndices.length && wrongFlags.length === 0;

    // Ghi nhận thống kê nhóm dấu hiệu
    currentCase.clueIndices.forEach(idx => {
      const clue = currentCase.allItems[idx].clue;
      if (clue) {
        this.categoryTally[clue.cat][1]++;
        if (this.flaggedIndices.has(idx)) {
          this.categoryTally[clue.cat][0]++;
        }
      }
    });

    const hasCitation = !isCorrect || wrongFlags.length > 0;
    if (hasCitation) {
      this.citations++;
      this.playSound('warning');
    } else {
      this.playSound('correct');
    }

    if (isCorrect) {
      this.correctCount++;
      // Tiền lương: +10đ đúng, +5đ thưởng nếu tìm trọn vẹn không đánh dấu nhầm
      this.salary += 10 + (isPerfect ? 5 : 0);
    }

    this.totalProcessed++;

    // Xây dựng log phân tích
    const logs: { type: 'hit' | 'miss' | 'warn'; message: string }[] = [];

    if (!isCorrect) {
      logs.push({
        type: 'warn',
        message: isScam
          ? '⚠ Đây là chiêu trò lừa đảo nhưng bạn đã cho qua!'
          : '⚠ Hồ sơ này hoàn toàn an toàn nhưng bạn đã từ chối nhầm.'
      });
    } else if (wrongFlags.length > 0) {
      logs.push({
        type: 'warn',
        message: `⚠ Kết luận đúng, nhưng bạn đã đánh dấu nhầm ${wrongFlags.length} chi tiết bình thường. Báo cáo thiếu chính xác bị cảnh cáo.`
      });
    }

    // Chi tiết từng clue
    currentCase.clueIndices.forEach(idx => {
      const clue = currentCase.allItems[idx].clue!;
      const wasDetected = this.flaggedIndices.has(idx);
      logs.push({
        type: wasDetected ? 'hit' : 'miss',
        message: `${wasDetected ? '✔ Đã phát hiện' : '✖ Bỏ sót'} · [${CLUE_CATEGORIES[clue.cat]}]: "${clue.text}". ${clue.why}${clue.rule ? ` (Quy tắc ${clue.rule})` : ''}`
      });
    });

    if (!isScam && currentCase.okWhy) {
      logs.push({
        type: 'hit',
        message: `✔ Hồ sơ an toàn: ${currentCase.okWhy}`
      });
    }

    this.isCaseEvaluated = true;
    this.currentResult = {
      isCorrect,
      userRejected,
      wrongFlagsCount: wrongFlags.length,
      detectedCluesCount: detectedClues.length,
      totalCluesCount: currentCase.clueIndices.length,
      isPerfect,
      logs
    };

    return { result: this.currentResult };
  }

  public nextCase(): boolean {
    if (this.currentCaseIndex < this.queue.length - 1) {
      this.currentCaseIndex++;
      this.resetCurrentCaseState();
      return true;
    }
    return false; // Hết hồ sơ trong ngày
  }

  public isDayComplete(): boolean {
    return this.currentCaseIndex >= this.queue.length - 1 && this.isCaseEvaluated;
  }

  public isFired(): boolean {
    return this.citations >= 3;
  }

  public tickTimer(): boolean {
    if (this.isRunning && !this.isCaseEvaluated) {
      this.timeRemaining--;
      if (this.timeRemaining <= 0) {
        this.isRunning = false;
        return true; // Hết giờ
      }
    }
    return false;
  }

  public getRulesForCurrentDay(): Rule[] {
    return RULES.filter(r => r.day <= this.day);
  }

  public getNewRulesToday(): Rule[] {
    return RULES.filter(r => r.day === this.day);
  }

  private shuffle<T>(array: T[]): T[] {
    const a = array.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  public playStampSound(isRejected: boolean) {
    try {
      const membrane = new Tone.MembraneSynth().toDestination();
      if (isRejected) {
        membrane.triggerAttackRelease("A1", "16n");
      } else {
        membrane.triggerAttackRelease("C2", "16n");
      }
    } catch {
      // Audio fallback
    }
  }

  public playSound(type: 'click' | 'correct' | 'warning' | 'chime') {
    try {
      const synth = new Tone.Synth().toDestination();
      if (type === 'click') {
        synth.triggerAttackRelease("G4", "32n");
      } else if (type === 'correct') {
        synth.triggerAttackRelease("E5", "16n");
      } else if (type === 'warning') {
        synth.triggerAttackRelease("F2", "8n");
      } else if (type === 'chime') {
        synth.triggerAttackRelease("B5", "8n");
      }
    } catch {
      // Audio fallback
    }
  }
}
