export const BRISTOL_SCALE = [
  { value: 1, label: '硬球球', emoji: '⚫', desc: '一颗颗硬球，很难排出', color: '#5D4037' },
  { value: 2, label: '香肠块', emoji: '🟤', desc: '表面凹凸不平的香肠状', color: '#6D4C41' },
  { value: 3, label: '香肠裂', emoji: '🌭', desc: '表面有裂痕的香肠状', color: '#795548' },
  { value: 4, label: '完美香肠', emoji: '💩', desc: '光滑柔软的香肠状，完美！', color: '#8D6E63' },
  { value: 5, label: '软团团', emoji: '🫠', desc: '柔软的团块，边界清晰', color: '#A1887F' },
  { value: 6, label: '糊糊状', emoji: '🫠', desc: '蓬松的糊状，边缘粗糙', color: '#BCAAA4' },
  { value: 7, label: '水样便', emoji: '💧', desc: '水样，没有固体块', color: '#D7CCC8' },
];

export const POOP_COLORS = [
  { value: 'brown', label: '棕色', emoji: '🟤', color: '#795548' },
  { value: 'dark-brown', label: '深棕', emoji: '⚫', color: '#3E2723' },
  { value: 'green', label: '绿色', emoji: '🟢', color: '#4CAF50' },
  { value: 'yellow', label: '黄色', emoji: '🟡', color: '#FFC107' },
  { value: 'red', label: '红色', emoji: '🔴', color: '#F44336' },
  { value: 'black', label: '黑色', emoji: '⬛', color: '#212121' },
];

export const MOODS = [
  { value: 'great', label: '畅快', emoji: '😎' },
  { value: 'good', label: '舒服', emoji: '😊' },
  { value: 'normal', label: '一般', emoji: '😐' },
  { value: 'struggle', label: '费力', emoji: '😣' },
  { value: 'painful', label: '痛苦', emoji: '😭' },
];

export const ACHIEVEMENTS = [
  {
    id: 'first-poop',
    name: '初出茅庐',
    desc: '完成第一次拉屎打卡',
    icon: '💩',
    check: (records) => records.length >= 1,
  },
  {
    id: 'five-poops',
    name: '五谷轮回',
    desc: '累计打卡5次',
    icon: '🌟',
    check: (records) => records.length >= 5,
  },
  {
    id: 'ten-poops',
    name: '十全十美',
    desc: '累计打卡10次',
    icon: '🏆',
    check: (records) => records.length >= 10,
  },
  {
    id: 'fifty-poops',
    name: '屎王降临',
    desc: '累计打卡50次',
    icon: '👑',
    check: (records) => records.length >= 50,
  },
  {
    id: 'hundred-poops',
    name: '百屎百中',
    desc: '累计打卡100次',
    icon: '💯',
    check: (records) => records.length >= 100,
  },
  {
    id: 'perfect-shape',
    name: '完美形态',
    desc: '记录一次布里斯托4型（完美香肠）',
    icon: '✨',
    check: (records) => records.some(r => r.shape === 4),
  },
  {
    id: 'speed-demon',
    name: '闪电侠',
    desc: '1分钟内完成一次打卡',
    icon: '⚡',
    check: (records) => records.some(r => r.duration && r.duration <= 60),
  },
  {
    id: 'marathon',
    name: '马拉松选手',
    desc: '单次打卡超过30分钟',
    icon: '🏃',
    check: (records) => records.some(r => r.duration && r.duration >= 1800),
  },
  {
    id: 'ultra-marathon',
    name: '铁人三项',
    desc: '单次打卡超过1小时（你没事吧？）',
    icon: '🤯',
    check: (records) => records.some(r => r.duration && r.duration >= 3600),
  },
  {
    id: 'streak-3',
    name: '三日连击',
    desc: '连续3天打卡',
    icon: '🔥',
    check: (records, streak) => streak >= 3,
  },
  {
    id: 'streak-7',
    name: '周周不落',
    desc: '连续7天打卡',
    icon: '🌈',
    check: (records, streak) => streak >= 7,
  },
  {
    id: 'streak-30',
    name: '月度全勤',
    desc: '连续30天打卡',
    icon: '🏅',
    check: (records, streak) => streak >= 30,
  },
  {
    id: 'triple-day',
    name: '一日三屎',
    desc: '同一天打卡3次',
    icon: '🎰',
    check: (records) => {
      const dateCounts = {};
      records.forEach(r => {
        dateCounts[r.date] = (dateCounts[r.date] || 0) + 1;
      });
      return Object.values(dateCounts).some(c => c >= 3);
    },
  },
  {
    id: 'night-owl',
    name: '夜猫子',
    desc: '在凌晨0-5点打卡',
    icon: '🦉',
    check: (records) => records.some(r => {
      const hour = new Date(r.startTime).getHours();
      return hour >= 0 && hour < 5;
    }),
  },
  {
    id: 'early-bird',
    name: '早起鸟儿',
    desc: '在早上5-8点打卡',
    icon: '🐦',
    check: (records) => records.some(r => {
      const hour = new Date(r.startTime).getHours();
      return hour >= 5 && hour < 8;
    }),
  },
  {
    id: 'color-explorer',
    name: '色彩大师',
    desc: '记录3种不同颜色',
    icon: '🎨',
    check: (records) => {
      const colors = new Set(records.map(r => r.color).filter(Boolean));
      return colors.size >= 3;
    },
  },
  {
    id: 'note-taker',
    name: '日记达人',
    desc: '添加5次备注',
    icon: '📝',
    check: (records) => records.filter(r => r.note && r.note.trim()).length >= 5,
  },
];

export function checkAchievements(records, streak) {
  const unlocked = JSON.parse(localStorage.getItem('poop-tracker-achievements') || '{}');
  const newAchievements = [];

  ACHIEVEMENTS.forEach(achievement => {
    if (!unlocked[achievement.id] && achievement.check(records, streak)) {
      unlocked[achievement.id] = new Date().toISOString();
      newAchievements.push(achievement);
    }
  });

  if (newAchievements.length > 0) {
    localStorage.setItem('poop-tracker-achievements', JSON.stringify(unlocked));
  }

  return { unlocked, newAchievements };
}

export function getUnlockedAchievements() {
  return JSON.parse(localStorage.getItem('poop-tracker-achievements') || '{}');
}
