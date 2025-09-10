#### 页面布局设计

```tsx
// 主界面 - 指挥部总览
export const CommandCenter: React.FC = () => {
  const { user } = useUserStore()
  const { todayProgress } = useStudyStore()

  return (
    <div className="min-h-screen bg-pixel-black crt-effect">
      {/* 顶部状态栏 */}
      <SoldierStatusBar />
      
      {/* 主要内容区域 */}
      <div className="container mx-auto px-4 pb-8">
        {/* 任务简报 */}
        <PixelCard variant="default" className="mb-6 p-6">
          <div className="text-center space-y-4">
            <div className="pixel-font text-lg text-contra-gold">
              🎯 MISSION BRIEFING
            </div>
            <div className="pixel-font text-sm text-pixel-white">
              OBJECTIVE: MASTER {todayProgress.target - todayProgress.completed} MORE VOCABULARY TARGETS
            </div>
            <div className="pixel-font text-xs text-pixel-light-gray">
              INTELLIGENCE REPORTS SHOW ENEMY WORDS IN THE AREA.
              <br />
              ELIMINATE THEM TO GAIN EXPERIENCE POINTS.
            </div>
          </div>
        </PixelCard>

        {/* 功能按钮网格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <MissionButton
            title="TRAINING CAMP"
            subtitle="Learn New Words"
            icon="🏕️"
            route="/study"
            variant="primary"
          />
          <MissionButton
            title="COMBAT ZONE"
            subtitle="Test Your Skills"
            icon="⚔️"
            route="/test"
            variant="danger"
          />
          <MissionButton
            title="INTEL REPORT"
            subtitle="View Progress"
            icon="📊"
            route="/progress"
            variant="secondary"
          />
          <MissionButton
            title="ARMORY"
            subtitle="Settings & Tools"
            icon="🛠️"
            route="/settings"
            variant="secondary"
          />
        </div>

        {/* 今日战况总结 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TodayBattleReport />
          <RecentAchievements />
        </div>
      </div>
    </div>
  )
}

// 任务按钮组件
interface MissionButtonProps {
  title: string
  subtitle: string
  icon: string
  route: string
  variant: 'primary' | 'secondary' | 'danger' | 'power-up'
}

const MissionButton: React.FC<MissionButtonProps> = ({
  title,
  subtitle,
  icon,
  route,
  variant
}) => {
  const navigate = useNavigate()

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <PixelCard
        variant="default"
        className="p-4 cursor-pointer h-full hover:shadow-lg transition-all duration-200"
        onClick={() => navigate(route)}
      >
        <div className="text-center space-y-3">
          <div className="text-3xl">{icon}</div>
          <div className="pixel-font text-sm text-contra-gold">
            {title}
          </div>
          <div className="pixel-font text-xs text-pixel-light-gray">
            {subtitle}
          </div>
          <PixelButton variant={variant} pixelSize="sm" className="w-full">
            ENTER
          </PixelButton>
        </div>
      </PixelCard>
    </motion.div>
  )
}

// 今日战况报告
const TodayBattleReport: React.FC = () => {
  const { todayProgress } = useStudyStore()

  return (
    <PixelCard variant="default" className="p-4">
      <div className="space-y-4">
        <div className="pixel-font text-sm text-contra-gold border-b border-pixel-gray pb-2">
          📋 TODAY'S BATTLE REPORT
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="pixel-font text-xs text-pixel-light-gray">ENEMIES DEFEATED:</span>
            <span className="pixel-font text-sm text-pixel-white">{todayProgress.completed}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="pixel-font text-xs text-pixel-light-gray">ACCURACY RATE:</span>
            <span className="pixel-font text-sm text-contra-green">
              {Math.round(todayProgress.accuracy)}%
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="pixel-font text-xs text-pixel-light-gray">TIME IN COMBAT:</span>
            <span className="pixel-font text-sm text-power-up-blue">
              {Math.floor(todayProgress.timeSpent / 60)}:${String(todayProgress.timeSpent % 60).padStart(2, '0')}
            </span>
          </div>
        </div>

        <PixelProgress
          label="MISSION PROGRESS"
          value={todayProgress.completed}
          max={todayProgress.target}
          variant="exp"
        />
      </div>
    </PixelCard>
  )
}

// 最近成就展示
const RecentAchievements: React.FC = () => {
  const { user } = useUserStore()
  
  return (
    <PixelCard variant="default" className="p-4">
      <div className="space-y-4">
        <div className="pixel-font text-sm text-contra-gold border-b border-pixel-gray pb-2">
          🏆 MILITARY HONORS
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          {user?.achievements?.slice(-4).map((achievementId, index) => (
            <div key={index} className="bg-pixel-gray pixel-border p-2 text-center">
              <div className="text-lg mb-1">🎖️</div>
              <div className="pixel-font text-xs text-pixel-white">BADGE #{index + 1}</div>
            </div>
          ))}
        </div>
        
        <PixelButton variant="secondary" pixelSize="sm" className="w-full">
          VIEW ALL HONORS
        </PixelButton>
      </div>
    </PixelCard>
  )
}

// 学习页面 - 训练营
export const TrainingCamp: React.FC = () => {
  const [currentWord, setCurrentWord] = useState<Vocabulary | null>(null)
  const [sessionActive, setSessionActive] = useState(false)
  const { startSession, endSession, recordWordStudy } = useStudyStore()

  const startTraining = () => {
    setSessionActive(true)
    startSession()
    loadNextWord()
  }### 3.2 本地存储优化策略

#### 存储容量管理
```typescript
class StorageManager {
  private readonly MAX_STORAGE_SIZE = 50 * 1024 * 1024; // 50MB
  private readonly WARNING_THRESHOLD = 0.8; // 80%使用率警告

  async checkStorageQuota(): Promise<{used: number; total: number; percentage: number}> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      return {
        used: estimate.usage || 0,
        total: estimate.quota || this.MAX_STORAGE_SIZE,
        percentage: ((estimate.usage || 0) / (estimate.quota || this.MAX_STORAGE_SIZE))
      };
    }
    
    // 降级方案：估算当前使用量
    const dbSize = await this.estimateIndexedDBSize();
    return {
      used: dbSize,
      total: this.MAX_STORAGE_SIZE,
      percentage: dbSize / this.MAX_STORAGE_SIZE
    };
  }

  private async estimateIndexedDBSize(): Promise<number> {
    let totalSize = 0;
    
    // 估算各表的大小
    const tables = [
      { name: 'users', avgSize: 1024 },
      { name: 'vocabularies', avgSize: 2048 },
      { name: 'studyRecords', avgSize: 512 },
      { name: 'testRecords', avgSize:# 雅思背单词应用 - 详细设计方案

## 1. 游戏化机制详细设计

### 1.1 核心游戏循环（Game Loop）

```
学习单词 → 获得经验值 → 角色成长 → 解锁新内容 → 更有挑战性的学习 → 循环
```

### 1.2 角色成长系统

#### 等级系统
- **学者等级**：1-50级，每级需要经验值递增
- **专业称号**：
  - Lv 1-10: 词汇新手 (Vocabulary Novice)
  - Lv 11-20: 单词学徒 (Word Apprentice)
  - Lv 21-30: 语言探索者 (Language Explorer)
  - Lv 31-40: 词汇大师 (Vocabulary Master)
  - Lv 41-50: 雅思传奇 (IELTS Legend)

#### 经验值获取机制
```
基础学习: 
- 新学单词: 10 XP
- 复习单词: 5 XP
- 连续答对: +2 XP (最高叠加5次)

测试闯关:
- 通过新手村: 50 XP
- 通过进阶关: 100 XP
- 通过高手关: 200 XP
- 通过大师关: 500 XP
- 完美通关(90%+): 额外50% XP

特殊奖励:
- 每日首次学习: 20 XP
- 连续签到7天: 100 XP
- 好友PK获胜: 30 XP
- 分享学习成果: 15 XP
```

### 1.3 收集养成系统

#### 虚拟宠物伙伴
- **词汇精灵**：随学习进度成长的虚拟宠物
- 喂养系统：用学习获得的"知识之果"喂养
- 进化系统：达到特定里程碑时精灵进化
- 技能系统：精灵可以提供学习buff（如记忆加速、提示次数增加）

#### 装备道具系统
```
学习道具:
- 记忆药水: 24小时内错误单词重复出现频率+50%
- 时间沙漏: 延长答题时间30秒
- 智慧之眼: 测试中可使用3次提示
- 专注光环: 1小时内学习经验值翻倍

装饰道具:
- 个人头像框
- 学习背景主题
- 特效动画
- 个性化称号
```

### 1.4 社交游戏化

#### 好友系统
- **学习伙伴**：添加好友，查看学习进度
- **互助机制**：向好友求助难词解释
- **礼物系统**：可赠送学习道具

#### 竞技模式
```
1v1 词汇对战:
- 实时匹配同等级玩家
- 限时答题，答对得分，答错扣分
- 胜利获得"对战币"，可兑换稀有道具

团队竞赛:
- 5人小队，共同完成每周挑战
- 团队贡献值排行
- 成功完成获得团队专属奖励
```

#### 排行榜系统
- 每日学习时长榜
- 每周新学词汇数榜
- 月度测试通过率榜
- 年度总经验值榜

### 1.5 成就徽章系统

#### 学习成就
```
词汇里程碑:
- 初学者: 学会100个单词
- 进步者: 学会500个单词
- 专家: 学会1000个单词
- 大师: 学会3000个单词

连续学习:
- 坚持者: 连续学习7天
- 恒心者: 连续学习30天
- 铁人: 连续学习100天

测试专家:
- 闯关新手: 通过10个测试关卡
- 挑战者: 通过50个测试关卡
- 完美主义者: 10次测试全部90%+通过
```

## 2. 测试题型详细设计

### 2.1 测试关卡进阶体系

#### 新手村 (正确率要求: 70%)
```
题型1: 基础认识 (40%)
- 看英文选中文
- 看中文选英文
- 听音选词

题型2: 形式识别 (30%)
- 音标匹配
- 词形辨析 (拼写相近词)
- 图片联想

题型3: 基础应用 (30%)
- 简单造句选择
- 基础同义词配对
```

#### 进阶关 (正确率要求: 75%)
```
题型1: 语境理解 (35%)
- 语境填空 (给出完整句子，选择合适单词)
- 句子重组 (包含目标单词的句子)
- 对话补全

题型2: 词汇辨析 (35%)
- 近义词辨析 (选择最合适的词)
- 反义词配对
- 词义层次判断 (positive/negative/neutral)

题型3: 搭配运用 (30%)
- 固定搭配选择
- 介词搭配
- 动词时态变化
```

#### 高手关 (正确率要求: 80%)
```
题型1: 雅思真题语境 (40%)
- 阅读理解中的词汇题
- 听力填空题
- 写作词汇替换题

题型2: 高级应用 (35%)
- 学术语境判断
- 正式/非正式语域区分
- 词汇强度判断 (如: good < great < excellent)

题型3: 综合运用 (25%)
- 段落摘要填空
- 同义句改写
- 词汇逻辑关系判断
```

#### 大师关 (正确率要求: 85%)
```
题型1: 创作应用 (45%)
- 微作文 (用指定词汇写50词短文)
- 口语表达 (录音回答，系统评估词汇使用)
- 改错题 (找出并纠正词汇使用错误)

题型2: 高阶理解 (35%)
- 隐含意义判断
- 语气色彩分析
- 文化背景理解

题型3: 教学测试 (20%)
- 给其他词汇配例句
- 解释词汇用法区别
- 创建记忆联想
```

### 2.2 自适应难度机制

#### 动态题目生成
```python
# 伪代码示例
def generate_question(user_level, word_difficulty, recent_performance):
    base_difficulty = word_difficulty
    
    # 根据用户最近表现调整
    if recent_performance > 0.9:
        difficulty_modifier = +0.2  # 增加难度
    elif recent_performance < 0.6:
        difficulty_modifier = -0.2  # 降低难度
    else:
        difficulty_modifier = 0
    
    # 根据用户等级调整
    level_modifier = user_level * 0.01
    
    final_difficulty = base_difficulty + difficulty_modifier + level_modifier
    
    return select_question_by_difficulty(final_difficulty)
```

#### 错误分析和重点复习
- 错误类型标记：拼写错误、语义混淆、搭配错误
- 智能推荐相似易错词汇
- 个性化错题本生成

### 2.3 测试反馈机制

#### 即时反馈
```
答对时：
- ✅ "太棒了！" + 词汇扩展信息
- 动画效果：星星飞舞 + 经验值+10

答错时：
- ❌ "再想想..." + 正确答案解析
- 提供记忆技巧和例句
- 自动加入复习列表
```

#### 阶段性总结
```
关卡完成后:
- 正确率统计图表
- 薄弱环节分析
- 建议复习词汇列表
- 下一关开启倒计时
```

## 3. 技术实现方案

### 3.1 前端架构

#### 技术栈选择
```
框架: React 18 + TypeScript
状态管理: Redux Toolkit + RTK Query
路由: React Router v6
UI组件库: Ant Design + 自定义游戏化组件
样式: Styled-components + CSS Module
动画: Framer Motion + Lottie
构建工具: Vite
测试: Jest + React Testing Library
```

#### 项目结构
```
src/
├── components/          # 通用组件
│   ├── GameUI/         # 游戏化UI组件
│   ├── Cards/          # 学习卡片组件
│   └── Charts/         # 数据可视化组件
├── pages/              # 页面组件
│   ├── Learn/          # 学习模块
│   ├── Test/           # 测试模块
│   ├── Profile/        # 个人中心
│   └── Social/         # 社交功能
├── hooks/              # 自定义Hooks
├── store/              # Redux状态管理
├── services/           # API服务
├── utils/              # 工具函数
└── types/              # TypeScript类型定义
```

#### 核心组件设计

```tsx
// 游戏化学习卡片组件
interface VocabularyCard {
  word: string;
  definition: string;
  pronunciation: string;
  examples: string[];
  difficulty: number;
  masteryLevel: number;
}

const GameVocabularyCard: React.FC<{
  card: VocabularyCard;
  onMastered: (word: string) => void;
  onNeedReview: (word: string) => void;
}> = ({ card, onMastered, onNeedReview }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showEffects, setShowEffects] = useState(false);

  return (
    <motion.div
      className="vocabulary-card"
      animate={{ rotateY: isFlipped ? 180 : 0 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* 卡片内容 */}
    </motion.div>
  );
};
```

#### PWA实现
```json
// manifest.json
{
  "name": "IELTS Vocabulary Game",
  "short_name": "IELTSVocab",
  "theme_color": "#4F46E5",
  "background_color": "#F8FAFC",
  "display": "standalone",
  "start_url": "/",
  "icons": [...],
  "features": ["offline-support", "push-notifications"]
}
```

## 3. 技术实现方案 (纯前端网页版)

### 3.1 技术栈选择

```
核心框架: React 18 + TypeScript
状态管理: Zustand (轻量级，无需后端)
本地存储: IndexedDB + localStorage备份
路由管理: React Router v6
UI框架: Tailwind CSS + shadcn/ui
动画效果: Framer Motion
图标库: Lucide React
音频处理: Web Audio API
构建工具: Vite
部署方式: 静态网站托管 (Vercel/Netlify)
```

### 3.2 项目结构

```
vocabulary-app/
├── public/
│   ├── audio/              # 词汇发音文件
│   ├── images/             # 词汇配图
│   ├── data/               # 预置词汇数据
│   │   ├── ielts-core.json # 核心词汇
│   │   ├── ielts-academic.json
│   │   └── ielts-general.json
│   └── manifest.json       # PWA配置
├── src/
│   ├── components/
│   │   ├── ui/             # 基础UI组件
│   │   ├── game/           # 游戏化组件
│   │   │   ├── VocabCard.tsx
│   │   │   ├── ProgressBar.tsx
│   │   │   ├── AchievementBadge.tsx
│   │   │   └── LevelIndicator.tsx
│   │   ├── study/          # 学习相关组件
│   │   │   ├── StudySession.tsx
│   │   │   ├── FlashCard.tsx
│   │   │   └── MemoryGame.tsx
│   │   ├── test/           # 测试相关组件
│   │   │   ├── QuestionCard.tsx
│   │   │   ├── TestResult.tsx
│   │   │   └── TimerWidget.tsx
│   │   └── layout/         # 布局组件
│   ├── pages/
│   │   ├── Home.tsx        # 主页/仪表板
│   │   ├── Study.tsx       # 学习页面
│   │   ├── Test.tsx        # 测试页面
│   │   ├── Progress.tsx    # 进度统计
│   │   └── Settings.tsx    # 设置页面
│   ├── hooks/
│   │   ├── useLocalStorage.ts
│   │   ├── useVocabulary.ts
│   │   ├── useStudySession.ts
│   │   └── useAchievements.ts
│   ├── stores/
│   │   ├── userStore.ts
│   │   ├── studyStore.ts
│   │   └── gameStore.ts
│   ├── utils/
│   │   ├── storage.ts      # 本地存储工具
│   │   ├── algorithms.ts   # 学习算法
│   │   ├── gameLogic.ts    # 游戏逻辑
│   │   └── dataLoader.ts   # 数据加载
│   ├── data/
│   │   ├── vocabularyData.ts
│   │   ├── achievementData.ts
│   │   └── questionTemplates.ts
│   └── types/
│       ├── vocabulary.ts
│       ├── user.ts
│       └── game.ts
```

### 3.3 数据存储方案

#### 本地存储架构
```typescript
// 存储层抽象
interface StorageAdapter {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T): Promise<void>;
  remove(key: string): Promise<void>;
  clear(): Promise<void>;
}

// IndexedDB实现
class IndexedDBStorage implements StorageAdapter {
  private dbName = 'VocabularyGame';
  private version = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // 创建对象存储
        if (!db.objectStoreNames.contains('users')) {
          db.createObjectStore('users', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('studyRecords')) {
          const store = db.createObjectStore('studyRecords', { keyPath: 'id' });
          store.createIndex('wordId', 'wordId', { unique: false });
          store.createIndex('userId', 'userId', { unique: false });
        }
        if (!db.objectStoreNames.contains('testRecords')) {
          db.createObjectStore('testRecords', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('achievements')) {
          db.createObjectStore('achievements', { keyPath: 'id' });
        }
      };
    });
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['users'], 'readonly');
      const store = transaction.objectStore('users');
      const request = store.get(key);
      
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async set<T>(key: string, value: T): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['users'], 'readwrite');
      const store = transaction.objectStore('users');
      const request = store.put({ id: key, data: value });
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

// localStorage降级实现
class LocalStorageAdapter implements StorageAdapter {
  async get<T>(key: string): Promise<T | null> {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  }

  async set<T>(key: string, value: T): Promise<void> {
    localStorage.setItem(key, JSON.stringify(value));
  }

  async remove(key: string): Promise<void> {
    localStorage.removeItem(key);
  }

  async clear(): Promise<void> {
    localStorage.clear();
  }
}

// 存储管理器
class StorageManager {
  private adapter: StorageAdapter;
  
  constructor() {
    // 检测支持情况，优先使用IndexedDB
    this.adapter = this.isIndexedDBSupported() 
      ? new IndexedDBStorage() 
      : new LocalStorageAdapter();
  }

  private isIndexedDBSupported(): boolean {
    return 'indexedDB' in window;
  }

  // 统一的存储接口
  async saveUserData(userData: UserData): Promise<void> {
    await this.adapter.set('user', userData);
  }

  async getUserData(): Promise<UserData | null> {
    return await this.adapter.get<UserData>('user');
  }

  async saveStudyRecord(record: StudyRecord): Promise<void> {
    const records = await this.getStudyRecords();
    records[record.wordId] = record;
    await this.adapter.set('studyRecords', records);
  }

  async getStudyRecords(): Promise<Record<string, StudyRecord>> {
    return await this.adapter.get<Record<string, StudyRecord>>('studyRecords') || {};
  }

  // 数据导出/导入
  async exportData(): Promise<string> {
    const userData = await this.getUserData();
    const studyRecords = await this.getStudyRecords();
    
    return JSON.stringify({
      user: userData,
      studyRecords,
      exportedAt: new Date().toISOString()
    }, null, 2);
  }

  async importData(jsonData: string): Promise<void> {
    const data = JSON.parse(jsonData);
    
    if (data.user) await this.saveUserData(data.user);
    if (data.studyRecords) {
      await this.adapter.set('studyRecords', data.studyRecords);
    }
  }
}

export const storage = new StorageManager();
```

#### 词汇数据加载
```typescript
// 词汇数据加载器
class VocabularyLoader {
  private cache: Map<string, Vocabulary[]> = new Map();
  private loaded = false;

  async loadVocabularyData(): Promise<void> {
    if (this.loaded) return;

    try {
      // 并行加载不同类型的词汇数据
      const [coreWords, academicWords, generalWords] = await Promise.all([
        this.fetchVocabularyFile('/data/ielts-core.json'),
        this.fetchVocabularyFile('/data/ielts-academic.json'),
        this.fetchVocabularyFile('/data/ielts-general.json')
      ]);

      this.cache.set('core', coreWords);
      this.cache.set('academic', academicWords);
      this.cache.set('general', generalWords);
      
      this.loaded = true;
    } catch (error) {
      console.error('加载词汇数据失败:', error);
      // 使用内置的最小词汇集
      this.cache.set('core', this.getMinimalVocabulary());
    }
  }

  private async fetchVocabularyFile(url: string): Promise<Vocabulary[]> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`加载失败: ${url}`);
    }
    return await response.json();
  }

  private getMinimalVocabulary(): Vocabulary[] {
    // 内置的基础词汇数据，确保应用能正常运行
    return [
      {
        id: '1',
        word: 'abandon',
        pronunciation: '/əˈbændən/',
        definitions: [{
          partOfSpeech: 'verb',
          meaning: 'to give up completely',
          examples: ['He abandoned his plan.']
        }],
        difficulty: 4,
        frequency: 85,
        tags: ['common']
      }
      // ... 更多基础词汇
    ];
  }

  getWordsByCategory(category: string): Vocabulary[] {
    return this.cache.get(category) || [];
  }

  getWordsByLevel(level: number): Vocabulary[] {
    const allWords = Array.from(this.cache.values()).flat();
    const maxDifficulty = Math.min(level + 2, 10);
    const minDifficulty = Math.max(level - 1, 1);
    
    return allWords.filter(word => 
      word.difficulty >= minDifficulty && word.difficulty <= maxDifficulty
    );
  }

  searchWords(query: string, limit = 20): Vocabulary[] {
    const allWords = Array.from(this.cache.values()).flat();
    const results = allWords.filter(word =>
      word.word.toLowerCase().includes(query.toLowerCase()) ||
      word.definitions.some(def => 
        def.meaning.toLowerCase().includes(query.toLowerCase())
      )
    );
    
    return results.slice(0, limit);
  }
}

export const vocabularyLoader = new VocabularyLoader();
```

### 3.4 状态管理 (Zustand)

```typescript
// 用户状态管理
interface UserState {
  user: UserData | null;
  isInitialized: boolean;
  
  // 用户操作
  initializeUser: (username: string) => Promise<void>;
  updateLevel: (newLevel: number) => void;
  addExperience: (exp: number) => void;
  updateStreak: () => void;
  addAchievement: (achievementId: string) => void;
  
  // 设置
  updateSettings: (settings: Partial<StudySettings>) => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  isInitialized: false,

  initializeUser: async (username: string) => {
    try {
      let user = await storage.getUserData();
      
      if (!user) {
        user = {
          id: crypto.randomUUID(),
          username,
          level: 1,
          experience: 0,
          streak: 0,
          achievements: [],
          statistics: {
            totalWordsStudied: 0,
            totalStudyTime: 0,
            averageAccuracy: 0,
            dailyGoalStreak: 0
          },
          settings: {
            dailyGoal: 20,
            studyReminder: true,
            reminderTime: '20:00',
            difficulty: 'medium',
            soundEnabled: true,
            darkMode: false
          },
          createdAt: new Date().toISOString(),
          lastActiveAt: new Date().toISOString()
        };
        
        await storage.saveUserData(user);
      } else {
        // 更新最后活跃时间
        user.lastActiveAt = new Date().toISOString();
        await storage.saveUserData(user);
      }
      
      set({ user, isInitialized: true });
    } catch (error) {
      console.error('初始化用户失败:', error);
    }
  },

  addExperience: (exp: number) => {
    const { user } = get();
    if (!user) return;

    const newExp = user.experience + exp;
    const newLevel = Math.floor(newExp / 1000) + 1;
    
    const updatedUser = {
      ...user,
      experience: newExp,
      level: newLevel
    };
    
    storage.saveUserData(updatedUser);
    set({ user: updatedUser });

    // 检查是否解锁新成就
    if (newLevel > user.level) {
      get().checkLevelAchievements(newLevel);
    }
  },

  updateStreak: () => {
    const { user } = get();
    if (!user) return;

    const today = new Date().toDateString();
    const lastActive = new Date(user.lastActiveAt).toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    let newStreak = user.streak;
    
    if (lastActive === yesterday) {
      newStreak += 1;
    } else if (lastActive !== today) {
      newStreak = 1;
    }

    const updatedUser = {
      ...user,
      streak: newStreak,
      lastActiveAt: new Date().toISOString()
    };
    
    storage.saveUserData(updatedUser);
    set({ user: updatedUser });
  },

  addAchievement: (achievementId: string) => {
    const { user } = get();
    if (!user || user.achievements.includes(achievementId)) return;

    const updatedUser = {
      ...user,
      achievements: [...user.achievements, achievementId]
    };
    
    storage.saveUserData(updatedUser);
    set({ user: updatedUser });
  },

  checkLevelAchievements: (level: number) => {
    const levelAchievements = [
      { level: 5, id: 'first_milestone' },
      { level: 10, id: 'dedicated_learner' },
      { level: 20, id: 'vocabulary_expert' },
      { level: 30, id: 'word_master' }
    ];

    levelAchievements.forEach(achievement => {
      if (level >= achievement.level) {
        get().addAchievement(achievement.id);
      }
    });
  }
}));

// 学习状态管理
interface StudyState {
  currentSession: StudySession | null;
  todayProgress: DailyProgress;
  
  startSession: () => void;
  endSession: () => void;
  recordWordStudy: (wordId: string, result: StudyResult) => Promise<void>;
  getTodayProgress: () => Promise<void>;
  getReviewWords: () => Promise<Vocabulary[]>;
}

export const useStudyStore = create<StudyState>((set, get) => ({
  currentSession: null,
  todayProgress: {
    target: 20,
    completed: 0,
    newWords: 0,
    reviewWords: 0,
    accuracy: 0,
    timeSpent: 0
  },

  startSession: () => {
    set({
      currentSession: {
        startTime: Date.now(),
        wordsStudied: [],
        totalCorrect: 0,
        totalTime: 0
      }
    });
  },

  endSession: () => {
    const { currentSession } = get();
    if (!currentSession) return;

    const totalTime = Date.now() - currentSession.startTime;
    const exp = currentSession.wordsStudied.length * 10 + currentSession.totalCorrect * 5;
    
    // 更新用户经验值
    useUserStore.getState().addExperience(exp);
    
    // 清除当前会话
    set({ currentSession: null });
    
    // 更新今日进度
    get().getTodayProgress();
  },

  recordWordStudy: async (wordId: string, result: StudyResult) => {
    const { currentSession } = get();
    if (!currentSession) return;

    try {
      // 更新学习记录
      const records = await storage.getStudyRecords();
      const existing = records[wordId];

      if (existing) {
        const newMasteryLevel = calculateMasteryLevel(
          existing.masteryLevel,
          existing.reviewCount,
          result.isCorrect
        );
        
        records[wordId] = {
          ...existing,
          masteryLevel: newMasteryLevel,
          reviewCount: existing.reviewCount + 1,
          correctCount: existing.correctCount + (result.isCorrect ? 1 : 0),
          lastReviewAt: new Date().toISOString(),
          nextReviewAt: calculateNextReview(newMasteryLevel, existing.reviewCount + 1).toISOString(),
          studyTime: existing.studyTime + result.timeSpent
        };
      } else {
        records[wordId] = {
          id: crypto.randomUUID(),
          wordId,
          masteryLevel: result.isCorrect ? 25 : 5,
          reviewCount: 1,
          correctCount: result.isCorrect ? 1 : 0,
          lastReviewAt: new Date().toISOString(),
          nextReviewAt: calculateNextReview(result.isCorrect ? 25 : 5, 1).toISOString(),
          studyTime: result.timeSpent,
          createdAt: new Date().toISOString()
        };
      }
      
      await storage.saveStudyRecord(records[wordId]);

      // 更新当前会话
      set({
        currentSession: {
          ...currentSession,
          wordsStudied: [...currentSession.wordsStudied, wordId],
          totalCorrect: currentSession.totalCorrect + (result.isCorrect ? 1 : 0),
          totalTime: currentSession.totalTime + result.timeSpent
        }
      });
      
    } catch (error) {
      console.error('记录学习进度失败:', error);
    }
  },

  getTodayProgress: async () => {
    const user = useUserStore.getState().user;
    if (!user) return;

    const records = await storage.getStudyRecords();
    const today = new Date().toDateString();
    
    const todayRecords = Object.values(records).filter(record =>
      new Date(record.lastReviewAt).toDateString() === today
    );

    const newWords = todayRecords.filter(r => r.reviewCount === 1).length;
    const reviewWords = todayRecords.filter(r => r.reviewCount > 1).length;
    const totalCorrect = todayRecords.reduce((sum, r) => sum + r.correctCount, 0);
    const totalReviews = todayRecords.reduce((sum, r) => sum + r.reviewCount, 0);
    const totalTime = todayRecords.reduce((sum, r) => sum + r.studyTime, 0);

    set({
      todayProgress: {
        target: user.settings.dailyGoal,
        completed: todayRecords.length,
        newWords,
        reviewWords,
        accuracy: totalReviews > 0 ? (totalCorrect / totalReviews) * 100 : 0,
        timeSpent: Math.floor(totalTime / 1000) // 转换为秒
      }
    });
  },

  getReviewWords: async () => {
    await vocabularyLoader.loadVocabularyData();
    const records = await storage.getStudyRecords();
    const now = new Date();
    
    const reviewRecords = Object.values(records).filter(record =>
      new Date(record.nextReviewAt) <= now
    );

    // 获取需要复习的词汇详情
    const allWords = Array.from(vocabularyLoader.cache.values()).flat();
    const reviewWords = reviewRecords
      .map(record => allWords.find(word => word.id === record.wordId))
      .filter(Boolean) as Vocabulary[];

    return reviewWords.slice(0, 50); // 限制数量
  }
}));

// 辅助函数
function calculateMasteryLevel(currentLevel: number, reviewCount: number, isCorrect: boolean): number {
  if (isCorrect) {
    const increase = (100 - currentLevel) * 0.3;
    return Math.min(currentLevel + increase, 100);
  } else {
    return Math.max(currentLevel * 0.7, 0);
  }
}

function calculateNextReview(masteryLevel: number, reviewCount: number): Date {
  const baseIntervals = [1, 4, 24, 72, 168, 720]; // 小时
  const intervalIndex = Math.min(reviewCount - 1, baseIntervals.length - 1);
  const baseInterval = baseIntervals[intervalIndex];
  
  const masteryFactor = masteryLevel / 100;
  const actualInterval = baseInterval * (0.5 + masteryFactor * 1.5);
  
  return new Date(Date.now() + actualInterval * 60 * 60 * 1000);
}
```

这个纯前端方案的核心特点：

1. **完全离线运行** - 所有数据存储在用户浏览器本地
2. **渐进式Web应用** - 支持安装到桌面，离线使用
3. **轻量级架构** - 无需服务器，部署简单
4. **数据可移植** - 支持导出/导入个人学习数据
5. **响应式设计** - 适配各种设备屏幕

你觉得这个纯前端方案如何？需要我详细展示某个具体组件的实现吗？### 3.5 核心组件实现

#### 学习卡片组件
```tsx
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, RotateCcw, Check, X } from 'lucide-react';

interface VocabularyCardProps {
  word: Vocabulary;
  onResult: (result: StudyResult) => void;
  showAnswer?: boolean;
}

export const VocabularyCard: React.FC<VocabularyCardProps> = ({ 
  word, 
  onResult,
  showAnswer = false 
}) => {
  const [isFlipped, setIsFlipped] = useState(showAnswer);
  const [startTime] = useState(Date.now());
  const [userAnswer, setUserAnswer] = useState('');
  
  const playAudio = () => {
    if (word.audioUrl) {
      const audio = new Audio(word.audioUrl);
      audio.play().catch(console.error);
    } else {
      // 使用Web Speech API作为降级方案
      const utterance = new SpeechSynthesisUtterance(word.word);
      utterance.lang = 'en-US';
      speechSynthesis.speak(utterance);
    }
  };

  const handleAnswer = (isCorrect: boolean) => {
    const timeSpent = Date.now() - startTime;
    onResult({
      wordId: word.id,
      isCorrect,
      timeSpent,
      userAnswer,
      timestamp: new Date().toISOString()
    });
  };

  return (
    <div className="relative w-full max-w-md mx-auto">
      <motion.div
        className="card-container"
        style={{ perspective: 1000 }}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
      >
        <motion.div
          className="card relative w-full h-96 cursor-pointer"
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6 }}
          style={{ transformStyle: 'preserve-3d' }}
          onClick={() => setIsFlipped(!isFlipped)}
        >
          {/* 正面 - 显示单词 */}
          <div className="card-face card-front absolute w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg p-6 flex flex-col items-center justify-center text-white">
            <div className="text-4xl font-bold mb-4">{word.word}</div>
            <div className="text-lg opacity-80 mb-4">{word.pronunciation}</div>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                playAudio();
              }}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
            >
              <Volume2 size={20} />
              <span>发音</span>
            </button>
            
            <div className="absolute bottom-4 text-sm opacity-60">
              点击翻转查看释义
            </div>
          </div>

          {/* 背面 - 显示释义 */}
          <div className="card-face card-back absolute w-full h-full bg-gradient-to-br from-green-500 to-teal-600 rounded-xl shadow-lg p-6 text-white">
            <div className="text-2xl font-bold mb-4">{word.word}</div>
            
            <div className="space-y-3 mb-6">
              {word.definitions.map((def, index) => (
                <div key={index} className="bg-white/20 rounded-lg p-3">
                  <div className="text-sm font-semibold text-yellow-200 mb-1">
                    {def.partOfSpeech}
                  </div>
                  <div className="text-base mb-2">{def.meaning}</div>
                  {def.examples.length > 0 && (
                    <div className="text-sm opacity-80 italic">
                      例句: {def.examples[0]}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-2 absolute bottom-4 left-6 right-6">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAnswer(false);
                }}
                className="flex-1 bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                <X size={20} />
                <span>不熟悉</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAnswer(true);
                }}
                className="flex-1 bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                <Check size={20} />
                <span>掌握了</span>
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};
```

#### 测试组件
```tsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Target } from 'lucide-react';

interface TestQuestionProps {
  question: TestQuestion;
  onAnswer: (answer: any) => void;
  timeLimit?: number;
}

export const TestQuestion: React.FC<TestQuestionProps> = ({ 
  question, 
  onAnswer, 
  timeLimit = 30 
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [isAnswered, setIsAnswered] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleSubmit = () => {
    if (isAnswered) return;
    
    setIsAnswered(true);
    onAnswer({
      questionId: question.id,
      userAnswer: selectedAnswer,
      isCorrect: selectedAnswer === question.correctAnswer,
      timeUsed: timeLimit - timeLeft
    });
  };

  const getProgressColor = () => {
    const percentage = (timeLeft / timeLimit) * 100;
    if (percentage > 60) return 'bg-green-500';
    if (percentage > 30) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-6">
      {/* 进度条和计时器 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Target className="text-blue-500" size={20} />
          <span className="font-semibold">
            {question.type === 'multiple_choice' ? '选择题' : '填空题'}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <Clock className="text-gray-500" size={16} />
          <span className={`font-mono ${timeLeft <= 10 ? 'text-red-500' : 'text-gray-600'}`}>
            {timeLeft}s
          </span>
        </div>
      </div>

      {/* 时间进度条 */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
        <motion.div
          className={`h-2 rounded-full ${getProgressColor()}`}
          initial={{ width: '100%' }}
          animate={{ width: `${(timeLeft / timeLimit) * 100}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* 题目内容 */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-4">{question.question}</h3>
        
        {question.context && (
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <p className="text-gray-700">{question.context}</p>
          </div>
        )}
      </div>

      {/* 选项 */}
      {question.type === 'multiple_choice' && (
        <div className="space-y-3 mb-6">
          {question.options.map((option, index) => (
            <motion.button
              key={index}
              className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                selectedAnswer === option
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              } ${isAnswered ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
              onClick={() => !isAnswered && setSelectedAnswer(option)}
              whileHover={!isAnswered ? { scale: 1.02 } : {}}
              whileTap={!isAnswered ? { scale: 0.98 } : {}}
              disabled={isAnswered}
            >
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  selectedAnswer === option 
                    ? 'border-blue-500 bg-blue-500' 
                    : 'border-gray-300'
                }`}>
                  {selectedAnswer === option && (
                    <div className="w-3 h-3 rounded-full bg-white"></div>
                  )}
                </div>
                <span className="font-medium">{String.fromCharCode(65 + index)}.</span>
                <span>{option}</span>
              </div>
            </motion.button>
          ))}
        </div>
      )}

      {/* 填空题输入 */}
      {question.type === 'fill_blank' && (
        <div className="mb-6">
          <input
            type="text"
            className="w-full p-4 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
            placeholder="请输入答案..."
            value={selectedAnswer || ''}
            onChange={(e) => setSelectedAnswer(e.target.value)}
            disabled={isAnswered}
          />
        </div>
      )}

      {/* 提交按钮 */}
      <button
        onClick={handleSubmit}
        disabled={!selectedAnswer || isAnswered}
        className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white font-semibold py-3 rounded-lg transition-colors"
      >
        {isAnswered ? '已提交' : '提交答案'}
      </button>
    </div>
  );
};
```

#### 进度统计组件
```tsx
import { useEffect, useState } from 'react';
import { Line, Doughnut } from 'react-chartjs-2';
import { Calendar, TrendingUp, Target, Clock } from 'lucide-react';

export const ProgressDashboard: React.FC = () => {
  const { user } = useUserStore();
  const { todayProgress, getTodayProgress } = useStudyStore();
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [statsData, setStatsData] = useState({
    totalWords: 0,
    masteredWords: 0,
    reviewingWords: 0,
    weakWords: 0
  });

  useEffect(() => {
    getTodayProgress();
    loadWeeklyData();
    loadStatsData();
  }, []);

  const loadWeeklyData = async () => {
    const records = await storage.getStudyRecords();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toDateString();
    });

    const dailyStats = last7Days.map(dateStr => {
      const dayRecords = Object.values(records).filter(record =>
        new Date(record.lastReviewAt).toDateString() === dateStr
      );
      
      return {
        date: dateStr,
        wordsStudied: dayRecords.length,
        accuracy: dayRecords.length > 0 
          ? (dayRecords.reduce((sum, r) => sum + r.correctCount, 0) / 
             dayRecords.reduce((sum, r) => sum + r.reviewCount, 0)) * 100 
          : 0
      };
    });

    setWeeklyData(dailyStats);
  };

  const loadStatsData = async () => {
    const records = await storage.getStudyRecords();
    const recordsArray = Object.values(records);
    
    const totalWords = recordsArray.length;
    const masteredWords = recordsArray.filter(r => r.masteryLevel >= 80).length;
    const reviewingWords = recordsArray.filter(r => r.masteryLevel >= 40 && r.masteryLevel < 80).length;
    const weakWords = recordsArray.filter(r => r.masteryLevel < 40).length;

    setStatsData({
      totalWords,
      masteredWords,
      reviewingWords,
      weakWords
    });
  };

  const chartData = {
    labels: weeklyData.map(d => new Date(d.date).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })),
    datasets: [
      {
        label: '学习单词数',
        data: weeklyData.map(d => d.wordsStudied),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4
      },
      {
        label: '正确率 (%)',
        data: weeklyData.map(d => d.accuracy),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
        yAxisID: 'y1'
      }
    ]
  };

  const doughnutData = {
    labels: ['已掌握', '学习中', '需加强'],
    datasets: [
      {
        data: [statsData.masteredWords, statsData.reviewingWords, statsData.weakWords],
        backgroundColor: ['#22c55e', '#f59e0b', '#ef4444'],
        borderWidth: 0
      }
    ]
  };

  return (
    <div className="space-y-6">
      {/* 今日进度卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">今日目标</p>
              <p className="text-2xl font-bold text-blue-600">
                {todayProgress.completed}/{todayProgress.target}
              </p>
            </div>
            <Target className="text-blue-500" size={24} />
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${(todayProgress.completed / todayProgress.target) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">连续天数</p>
              <p className="text-2xl font-bold text-green-600">{user?.streak || 0}</p>
            </div>
            <Calendar className="text-green-500" size={24} />
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">当前等级</p>
              <p className="text-2xl font-bold text-purple-600">{user?.level || 1}</p>
            </div>
            <TrendingUp className="text-purple-500" size={24} />
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">学习时间</p>
              <p className="text-2xl font-bold text-orange-600">
                {Math.floor(todayProgress.timeSpent / 60)}分钟
              </p>
            </div>
            <Clock className="text-orange-500" size={24} />
          </div>
        </div>
      </div>

      {/* 图表区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">学习趋势</h3>
          <Line 
            data={chartData} 
            options={{
              responsive: true,
              scales: {
                y: { beginAtZero: true },
                y1: { 
                  type: 'linear',
                  position: 'right',
                  beginAtZero: true,
                  max: 100,
                  grid: { drawOnChartArea: false }
                }
              }
            }} 
          />
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">词汇掌握情况</h3>
          <div className="flex items-center justify-center">
            <Doughnut 
              data={doughnutData}
              options={{
                responsive: true,
                plugins: {
                  legend: { position: 'bottom' }
                }
              }}
            />
          </div>
          <div className="mt-4 text-center">
            <p className="text-2xl font-bold">{statsData.totalWords}</p>
            <p className="text-gray-600">总学习词汇</p>
          </div>
        </div>
      </div>

      {/* 成就展示 */}
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">最近获得的成就</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {user?.achievements?.slice(-4).map(achievementId => (
            <div key={achievementId} className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-3xl mb-2">🏆</div>
              <p className="text-sm font-medium">成就徽章</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
```

### 3.6 部署方案

#### 静态网站部署 (Vercel)
```json
// vercel.json
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/audio/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    },
    {
      "source": "/images/(.*)",
      "headers": [
        {
          "key": "Cache-Control", 
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

#### PWA配置
```json
// public/manifest.json
{
  "name": "雅思词汇游戏",
  "short_name": "IELTS Vocab",
  "description": "趣味化雅思词汇学习工具",
  "theme_color": "#3B82F6",
  "background_color": "#F8FAFC",
  "display": "standalone",
  "orientation": "portrait",
  "start_url": "/",
  "scope": "/",
  "icons": [
    {
      "src": "/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-128x128.png", 
      "sizes": "128x128",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192", 
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ],
  "shortcuts": [
    {
      "name": "开始学习",
      "url": "/study",
      "description": "立即开始词汇学习"
    },
    {
      "name": "测试挑战", 
      "url": "/test",
      "description": "参加词汇测试"
    }
  ]
}
```

#### 构建和优化配置
```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
      manifest: {
        name: '雅思词汇游戏',
        short_name: 'IELTS Vocab',
        description: '趣味化雅思词汇学习工具',
        theme_color: '#3B82F6',
        icons: [
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json,mp3}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1年
              }
            }
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30天
              }
            }
          },
          {
            urlPattern: /\.(?:mp3|wav|ogg)$/,
            handler: 'CacheFirst', 
            options: {
              cacheName: 'audio-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 90 // 90天
              }
            }
          }
        ]
      }
    })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['framer-motion', 'lucide-react'],
          charts: ['chart.js', 'react-chartjs-2']
        }
      }
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'zustand']
  }
});
```

这个完整的前端解决方案提供了：

1. **完全离线能力** - 所有功能都在客户端运行
2. **渐进式Web应用** - 可安装，支持离线使用
3. **响应式设计** - 适配手机、平板、电脑
4. **游戏化体验** - 动画效果、进度反馈、成就系统
5. **数据持久化** - 本地存储学习进度
6. **性能优化** - 代码分割、缓存策略、懒加载

整个应用可以部署到任何静态网站托管服务上，用户只需要访问网址就能使用，无需安装任何软件。你觉得这个方案如何？需要我详细解释某个特定的实现细节吗？### 3.7 性能优化和用户体验

#### 加载性能优化
```typescript
// 懒加载组件
import { lazy, Suspense } from 'react';

const StudyPage = lazy(() => import('./pages/Study'));
const TestPage = lazy(() => import('./pages/Test'));
const ProgressPage = lazy(() => import('./pages/Progress'));

// 预加载关键资源
export const usePreloader = () => {
  useEffect(() => {
    // 预加载音频文件
    const preloadAudio = async () => {
      const commonWords = ['abandon', 'academic', 'achieve']; // 高频词汇
      commonWords.forEach(word => {
        const audio = new Audio(`/audio/${word}.mp3`);
        audio.preload = 'metadata';
      });
    };

    // 预加载图片资源
    const preloadImages = () => {
      const images = ['/images/achievement-badge.png', '/images/level-up.gif'];
      images.forEach(src => {
        const img = new Image();
        img.src = src;
      });
    };

    preloadAudio();
    preloadImages();
  }, []);
};

// 图片懒加载组件
const LazyImage: React.FC<{ src: string; alt: string; className?: string }> = ({ 
  src, 
  alt, 
  className 
}) => {
  const [imageSrc, setImageSrc] = useState('/images/placeholder.svg');
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const img = new Image();
          img.onload = () => {
            setImageSrc(src);
            setIsLoaded(true);
          };
          img.src = src;
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [src]);

  return (
    <img
      ref={imgRef}
      src={imageSrc}
      alt={alt}
      className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-50'} ${className}`}
      loading="lazy"
    />
  );
};
```

#### 响应式设计适配
```tsx
// 响应式Hook
export const useBreakpoint = () => {
  const [breakpoint, setBreakpoint] = useState('md');

  useEffect(() => {
    const checkBreakpoint = () => {
      if (window.innerWidth < 640) setBreakpoint('sm');
      else if (window.innerWidth < 768) setBreakpoint('md');
      else if (window.innerWidth < 1024) setBreakpoint('lg');
      else setBreakpoint('xl');
    };

    checkBreakpoint();
    window.addEventListener('resize', checkBreakpoint);
    return () => window.removeEventListener('resize', checkBreakpoint);
  }, []);

  return breakpoint;
};

// 自适应学习卡片
export const ResponsiveVocabCard: React.FC<{ word: Vocabulary }> = ({ word }) => {
  const breakpoint = useBreakpoint();
  const isMobile = breakpoint === 'sm';

  return (
    <motion.div
      className={`
        bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg text-white
        ${isMobile ? 'p-4 h-80' : 'p-6 h-96'}
      `}
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
    >
      <div className={`text-center ${isMobile ? 'space-y-2' : 'space-y-4'}`}>
        <h2 className={`font-bold ${isMobile ? 'text-2xl' : 'text-4xl'}`}>
          {word.word}
        </h2>
        <p className={`opacity-80 ${isMobile ? 'text-sm' : 'text-lg'}`}>
          {word.pronunciation}
        </p>
        
        {/* 移动端简化显示 */}
        {isMobile ? (
          <div className="bg-white/20 rounded-lg p-3">
            <p className="text-sm">{word.definitions[0]?.meaning}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {word.definitions.map((def, index) => (
              <div key={index} className="bg-white/20 rounded-lg p-3">
                <span className="text-yellow-200 font-semibold text-sm">
                  {def.partOfSpeech}
                </span>
                <p className="mt-1">{def.meaning}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};
```

#### 离线优化策略
```typescript
// 网络状态检测
export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [networkType, setNetworkType] = useState<string>('unknown');

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // 检测网络类型 (如果支持)
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      setNetworkType(connection.effectiveType || 'unknown');
      
      const updateNetworkType = () => {
        setNetworkType(connection.effectiveType || 'unknown');
      };
      
      connection.addEventListener('change', updateNetworkType);
      
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
        connection.removeEventListener('change', updateNetworkType);
      };
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline, networkType };
};

// 离线提示组件
export const OfflineIndicator: React.FC = () => {
  const { isOnline } = useNetworkStatus();

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-orange-500 text-white text-center py-2 z-50">
      <div className="flex items-center justify-center gap-2">
        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
        <span>离线模式 - 部分功能可能受限</span>
      </div>
    </div>
  );
};

// 离线数据同步
class OfflineDataSync {
  private pendingActions: Array<{
    id: string;
    action: string;
    data: any;
    timestamp: number;
  }> = [];

  constructor() {
    this.loadPendingActions();
    this.setupOnlineListener();
  }

  private loadPendingActions() {
    const stored = localStorage.getItem('pendingActions');
    if (stored) {
      this.pendingActions = JSON.parse(stored);
    }
  }

  private savePendingActions() {
    localStorage.setItem('pendingActions', JSON.stringify(this.pendingActions));
  }

  private setupOnlineListener() {
    window.addEventListener('online', () => {
      this.syncPendingActions();
    });
  }

  addPendingAction(action: string, data: any) {
    const pendingAction = {
      id: crypto.randomUUID(),
      action,
      data,
      timestamp: Date.now()
    };

    this.pendingActions.push(pendingAction);
    this.savePendingActions();

    // 如果在线，立即尝试同步
    if (navigator.onLine) {
      this.syncPendingActions();
    }
  }

  private async syncPendingActions() {
    if (this.pendingActions.length === 0) return;

    const actionsToSync = [...this.pendingActions];
    
    for (const action of actionsToSync) {
      try {
        await this.executeAction(action);
        // 成功后从队列中移除
        this.pendingActions = this.pendingActions.filter(a => a.id !== action.id);
      } catch (error) {
        console.warn('同步失败，将在下次上线时重试:', error);
        break; // 如果一个失败，停止同步其他的
      }
    }

    this.savePendingActions();
  }

  private async executeAction(action: { action: string; data: any }) {
    // 这里可以添加实际的同步逻辑
    // 由于是纯前端应用，主要是数据验证和本地存储同步
    console.log('执行同步操作:', action);
  }
}

export const offlineSync = new OfflineDataSync();
```

### 3.8 用户体验增强

#### 动画和反馈系统
```tsx
// 成就弹窗组件
import { motion, AnimatePresence } from 'framer-motion';

interface AchievementPopupProps {
  achievement: Achievement | null;
  onClose: () => void;
}

export const AchievementPopup: React.FC<AchievementPopupProps> = ({ 
  achievement, 
  onClose 
}) => {
  useEffect(() => {
    if (achievement) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [achievement, onClose]);

  return (
    <AnimatePresence>
      {achievement && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg p-6 text-white shadow-2xl pointer-events-auto"
            initial={{ scale: 0, rotateZ: -180 }}
            animate={{ scale: 1, rotateZ: 0 }}
            exit={{ scale: 0, rotateZ: 180 }}
            transition={{ type: "spring", damping: 15, stiffness: 300 }}
          >
            <div className="text-center">
              <motion.div
                className="text-6xl mb-4"
                animate={{ rotateY: [0, 360] }}
                transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
              >
                🏆
              </motion.div>
              <h3 className="text-2xl font-bold mb-2">成就解锁！</h3>
              <p className="text-lg">{achievement.name}</p>
              <p className="text-sm opacity-90 mt-2">{achievement.description}</p>
            </div>
          </motion.div>

          {/* 粒子效果 */}
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-yellow-300 rounded-full"
                initial={{
                  x: '50vw',
                  y: '50vh',
                  opacity: 1,
                }}
                animate={{
                  x: Math.random() * window.innerWidth,
                  y: Math.random() * window.innerHeight,
                  opacity: 0,
                }}
                transition={{
                  duration: 2,
                  delay: Math.random() * 0.5,
                  ease: "easeOut"
                }}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// 学习反馈动画
export const StudyFeedback: React.FC<{
  result: 'correct' | 'incorrect' | null;
  onComplete: () => void;
}> = ({ result, onComplete }) => {
  useEffect(() => {
    if (result) {
      const timer = setTimeout(onComplete, 1500);
      return () => clearTimeout(timer);
    }
  }, [result, onComplete]);

  return (
    <AnimatePresence>
      {result && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center z-40 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className={`text-8xl ${result === 'correct' ? 'text-green-500' : 'text-red-500'}`}
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.2, 1] }}
            transition={{ duration: 0.6, times: [0, 0.6, 1] }}
          >
            {result === 'correct' ? '✓' : '✗'}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
```

#### 语音和音频处理
```typescript
// 语音合成服务
class SpeechService {
  private synth: SpeechSynthesis;
  private voices: SpeechSynthesisVoice[] = [];

  constructor() {
    this.synth = window.speechSynthesis;
    this.loadVoices();
    
    // 监听语音列表更新
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = () => this.loadVoices();
    }
  }

  private loadVoices() {
    this.voices = this.synth.getVoices();
  }

  speak(text: string, options: { rate?: number; pitch?: number; lang?: string } = {}) {
    // 停止当前播放
    this.synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // 选择合适的语音
    const englishVoices = this.voices.filter(voice => 
      voice.lang.startsWith('en')
    );
    
    if (englishVoices.length > 0) {
      utterance.voice = englishVoices[0];
    }
    
    utterance.rate = options.rate || 0.8;
    utterance.pitch = options.pitch || 1;
    utterance.lang = options.lang || 'en-US';
    
    this.synth.speak(utterance);
  }

  stop() {
    this.synth.cancel();
  }
}

// 音频播放管理
class AudioManager {
  private audioCache: Map<string, HTMLAudioElement> = new Map();
  private isMuted = false;

  constructor() {
    this.loadSettings();
  }

  private loadSettings() {
    const settings = localStorage.getItem('audioSettings');
    if (settings) {
      const parsed = JSON.parse(settings);
      this.isMuted = parsed.isMuted || false;
    }
  }

  private saveSettings() {
    localStorage.setItem('audioSettings', JSON.stringify({
      isMuted: this.isMuted
    }));
  }

  async preloadAudio(urls: string[]) {
    const promises = urls.map(url => this.loadAudio(url));
    await Promise.allSettled(promises);
  }

  private loadAudio(url: string): Promise<HTMLAudioElement> {
    return new Promise((resolve, reject) => {
      if (this.audioCache.has(url)) {
        resolve(this.audioCache.get(url)!);
        return;
      }

      const audio = new Audio(url);
      audio.preload = 'auto';
      
      audio.addEventListener('canplaythrough', () => {
        this.audioCache.set(url, audio);
        resolve(audio);
      });
      
      audio.addEventListener('error', reject);
    });
  }

  async playAudio(url: string, volume = 1) {
    if (this.isMuted) return;

    try {
      const audio = await this.loadAudio(url);
      audio.volume = volume;
      audio.currentTime = 0;
      await audio.play();
    } catch (error) {
      console.warn('音频播放失败:', error);
    }
  }

  playSuccessSound() {
    this.playAudio('/audio/success.mp3', 0.3);
  }

  playErrorSound() {
    this.playAudio('/audio/error.mp3', 0.3);
  }

  playLevelUpSound() {
    this.playAudio('/audio/levelup.mp3', 0.5);
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    this.saveSettings();
    return this.isMuted;
  }

  get muted() {
    return this.isMuted;
  }
}

export const speechService = new SpeechService();
export const audioManager = new AudioManager();
```

#### 无障碍支持
```tsx
// 键盘导航支持
export const useKeyboardNavigation = (onAction: (action: string) => void) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // 防止在输入框中触发
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (event.key) {
        case ' ':
        case 'Enter':
          event.preventDefault();
          onAction('flip');
          break;
        case '1':
          event.preventDefault();
          onAction('answer-1');
          break;
        case '2':
          event.preventDefault();
          onAction('answer-2');
          break;
        case '3':
          event.preventDefault();
          onAction('answer-3');
          break;
        case '4':
          event.preventDefault();
          onAction('answer-4');
          break;
        case 'ArrowLeft':
          event.preventDefault();
          onAction('previous');
          break;
        case 'ArrowRight':
          event.preventDefault();
          onAction('next');
          break;
        case 'r':
          event.preventDefault();
          onAction('repeat');
          break;
        case 's':
          event.preventDefault();
          onAction('speak');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onAction]);
};

// 高对比度模式支持
export const HighContrastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [highContrast, setHighContrast] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('highContrast');
    if (stored) {
      setHighContrast(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('highContrast', JSON.stringify(highContrast));
    
    if (highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  }, [highContrast]);

  return (
    <div className={highContrast ? 'high-contrast-mode' : ''}>
      {children}
      
      <button
        onClick={() => setHighContrast(!highContrast)}
        className="fixed bottom-4 left-4 p-2 bg-gray-800 text-white rounded-full z-50"
        aria-label="切换高对比度模式"
      >
        {highContrast ? '🌞' : '🌙'}
      </button>
    </div>
  );
};

// 屏幕阅读器支持
export const ScreenReaderAnnouncement: React.FC<{ message: string }> = ({ message }) => {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    >
      {message}
    </div>
  );
};
```

### 3.9 部署和发布

#### 自动化部署脚本
```bash
#!/bin/bash
# deploy.sh

echo "🚀 开始部署雅思词汇应用..."

# 安装依赖
echo "📦 安装依赖..."
npm install

# 构建应用
echo "🔨 构建应用..."
npm run build

# 优化构建结果
echo "⚡ 优化资源..."
npm run optimize

# 生成PWA资源
echo "📱 生成PWA资源..."
npm run pwa:generate

# 部署到静态托管
echo "🌐 部署到Vercel..."
npx vercel --prod

echo "✅ 部署完成！"
echo "📊 构建统计:"
npm run analyze

echo "🎉 雅思词汇应用已成功部署！"
```

#### 性能监控配置
```typescript
// 性能监控
class PerformanceMonitor {
  private metrics: Map<string, number[]> = new Map();

  startTimer(name: string): () => number {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      this.recordMetric(name, duration);
      return duration;
    };
  }

  recordMetric(name: string, value: number) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    
    const values = this.metrics.get(name)!;
    values.push(value);
    
    // 只保留最近100个数据点
    if (values.length > 100) {
      values.shift();
    }
  }

  getAverageMetric(name: string): number {
    const values = this.metrics.get(name) || [];
    if (values.length === 0) return 0;
    
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  reportMetrics() {
    const report: Record<string, any> = {};
    
    this.metrics.forEach((values, name) => {
      report[name] = {
        average: this.getAverageMetric(name),
        count: values.length,
        min: Math.min(...values),
        max: Math.max(...values)
      };
    });

    console.table(report);
    return report;
  }
}

export const performanceMonitor = new PerformanceMonitor();

// 使用示例
export const usePerformanceMonitor = (componentName: string) => {
  useEffect(() => {
    const endTimer = performanceMonitor.startTimer(`${componentName}_render`);
    
    return () => {
      endTimer();
    };
  });
};
```

这个完整的纯前端解决方案现在包含了：

1. **完整的技术架构** - 现代化的前端技术栈
2. **本地数据存储** - IndexedDB + localStorage双重保障
3. **PWA离线支持** - 完全离线可用的渐进式Web应用
4. **响应式设计** - 适配各种设备和屏幕
5. **游戏化体验** - 丰富的动画和交互效果
6. **无障碍支持** - 键盘导航、屏幕阅读器、高对比度
7. **性能优化** - 懒加载、缓存、代码分割
8. **用户体验** - 音频反馈、离线提示、成就系统

整个应用可以部署到任何静态网站托管服务（如Vercel、Netlify、GitHub Pages），用户只需打开网址就能使用，支持安装到桌面作为原生应用使用。你觉得这个方案是否满足你的需求？还有什么特定功能需要进一步完善吗？