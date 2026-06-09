export const EXERCISE_TYPES = [
  { value: 1, label: '跑步', emoji: '🏃', desc: '户外跑、跑步机、慢跑', color: '#4CAF50' },
  { value: 2, label: '力量训练', emoji: '🏋️', desc: '举铁、器械、自重训练', color: '#F44336' },
  { value: 3, label: '瑜伽', emoji: '🧘', desc: '瑜伽、拉伸、冥想', color: '#9C27B0' },
  { value: 4, label: '游泳', emoji: '🏊', desc: '自由泳、蛙泳、蝶泳', color: '#2196F3' },
  { value: 5, label: '骑行', emoji: '🚴', desc: '公路车、山地车、动感单车', color: '#FF9800' },
  { value: 6, label: 'HIIT', emoji: '🔥', desc: '高强度间歇训练', color: '#E91E63' },
  { value: 7, label: '其他', emoji: '🎯', desc: '球类、跳绳、攀岩等', color: '#607D8B' },
];

export const INTENSITY_LEVELS = [
  { value: 'easy', label: '轻松', emoji: '😊', color: '#81C784' },
  { value: 'moderate', label: '适中', emoji: '💪', color: '#FFB74D' },
  { value: 'hard', label: '较累', emoji: '😤', color: '#FF8A65' },
  { value: 'sweaty', label: '暴汗', emoji: '🥵', color: '#E57373' },
  { value: 'extreme', label: '极限', emoji: '💀', color: '#B71C1C' },
];

export const MOODS = [
  { value: 'great', label: '超爽', emoji: '😎' },
  { value: 'good', label: '舒服', emoji: '😊' },
  { value: 'normal', label: '一般', emoji: '😐' },
  { value: 'struggle', label: '费力', emoji: '😣' },
  { value: 'painful', label: '痛苦', emoji: '😭' },
];

export const ACHIEVEMENTS = [
  {
    id: 'first-workout',
    name: '初出茅庐',
    desc: '完成第一次运动打卡',
    icon: '🏅',
    check: (records) => records.length >= 1,
  },
  {
    id: 'five-workouts',
    name: '五次出击',
    desc: '累计打卡5次',
    icon: '🌟',
    check: (records) => records.length >= 5,
  },
  {
    id: 'ten-workouts',
    name: '十全十美',
    desc: '累计打卡10次',
    icon: '🏆',
    check: (records) => records.length >= 10,
  },
  {
    id: 'fifty-workouts',
    name: '健身达人',
    desc: '累计打卡50次',
    icon: '👑',
    check: (records) => records.length >= 50,
  },
  {
    id: 'hundred-workouts',
    name: '百炼成钢',
    desc: '累计打卡100次',
    icon: '💯',
    check: (records) => records.length >= 100,
  },
  {
    id: 'perfect-form',
    name: '完美训练',
    desc: '完成一次30-60分钟的运动',
    icon: '✨',
    check: (records) => records.some(r => r.duration && r.duration >= 1800 && r.duration <= 3600),
  },
  {
    id: 'speed-demon',
    name: '闪电侠',
    desc: '10分钟内完成一次打卡',
    icon: '⚡',
    check: (records) => records.some(r => r.duration && r.duration <= 600),
  },
  {
    id: 'marathon',
    name: '耐力王者',
    desc: '单次运动超过1小时',
    icon: '🏃',
    check: (records) => records.some(r => r.duration && r.duration >= 3600),
  },
  {
    id: 'ultra-marathon',
    name: '铁人三项',
    desc: '单次运动超过2小时',
    icon: '🤯',
    check: (records) => records.some(r => r.duration && r.duration >= 7200),
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
    name: '一日三练',
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
    desc: '在早上5-7点打卡',
    icon: '🐦',
    check: (records) => records.some(r => {
      const hour = new Date(r.startTime).getHours();
      return hour >= 5 && hour < 7;
    }),
  },
  {
    id: 'variety-master',
    name: '全能选手',
    desc: '完成3种不同运动类型',
    icon: '🎨',
    check: (records) => {
      const types = new Set(records.map(r => r.shape).filter(Boolean));
      return types.size >= 3;
    },
  },
  {
    id: 'note-taker',
    name: '笔记达人',
    desc: '添加5次运动备注',
    icon: '📝',
    check: (records) => records.filter(r => r.note && r.note.trim()).length >= 5,
  },
];
