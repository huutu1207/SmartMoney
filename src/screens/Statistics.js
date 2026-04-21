import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    StyleSheet,
    Dimensions,
    ScrollView,
    Animated,
    Text,
    TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PieChart } from 'react-native-chart-kit';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from '../services/firebaseConfig';
import { Timestamp } from 'firebase/firestore';
import { ThemeContext } from '../context/ThemeContext';
import { useTheme } from 'react-native-paper';
const { width } = Dimensions.get('window');

// ── Palette (Light) ───────────────────────────────────
const C = {
    bg: '#F4F6FB',
    surface: '#FFFFFF',
    card: '#FFFFFF',
    cardAlt: '#F9FAFB',
    border: '#E8ECF4',
    accent: '#3B6FF0',
    accentLight: '#EEF2FF',
    green: '#10B981',
    greenLight: '#ECFDF5',
    red: '#EF4444',
    redLight: '#FEF2F2',
    text: '#111827',
    sub: '#6B7280',
    muted: '#D1D5DB',
    chartColors: ['#3B6FF0', '#10B981', '#F472B6', '#F59E0B', '#8B5CF6', '#FB923C'],
};


const getQuarterRange = () => {
    const now = new Date();
    const quarter = Math.floor(now.getMonth() / 3); // 0, 1, 2, 3
    const start = new Date(now.getFullYear(), quarter * 3, 1);
    const end = new Date(now.getFullYear(), (quarter + 1) * 3, 0, 23, 59, 59);
    return { start, end };
};

const getMonthRange = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    return { start, end };
};

const getYearRange = () => {
    const now = new Date();
    // Bắt đầu từ 01/01 và kết thúc vào 31/12 của năm hiện tại
    const start = new Date(now.getFullYear(), 0, 1, 0, 0, 0);
    const end = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
    return { start, end };
};

const formatVND = (n) => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}tr`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
    return `${n}`;
};

// ── FadeIn ────────────────────────────────────────────
const FadeIn = ({ delay = 0, children, style }) => {
    const opacity = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(16)).current;
    useEffect(() => {
        Animated.parallel([
            Animated.timing(opacity, { toValue: 1, duration: 480, delay, useNativeDriver: true }),
            Animated.timing(translateY, { toValue: 0, duration: 480, delay, useNativeDriver: true }),
        ]).start();
    }, []);
    return (
        <Animated.View style={[{ opacity, transform: [{ translateY }] }, style]}>
            {children}
        </Animated.View>
    );
};

// ── Legend Item ───────────────────────────────────────
const LegendItem = ({ item, total, index }) => {
    const pct = total > 0 ? ((item.amount / total) * 100).toFixed(1) : 0;
    const barAnim = useRef(new Animated.Value(0)).current;
    const theme = useTheme();

    useEffect(() => {
        Animated.timing(barAnim, {
            toValue: parseFloat(pct),
            duration: 900,
            delay: 300 + index * 90,
            useNativeDriver: false,
        }).start();
    }, [pct]);

    return (
        <FadeIn delay={150 + index * 70}>
            <View style={styles.legendRow}>
                <View style={[styles.legendColorBar, { borderBottomColor: theme.colors.outlineVariant }]} />
                <View style={{ flex: 1 }}>
                    <View style={styles.legendMeta}>
                        <Text style={[styles.legendName, { color: theme.colors.onSurface }]}>
                            {item.name}
                        </Text>
                        <Text style={styles.legendAmount}>{formatVND(item.amount)}đ</Text>
                    </View>
                    <View style={styles.trackBg}>
                        <Animated.View
                            style={[
                                styles.trackFill,
                                {
                                    backgroundColor: item.color,
                                    width: barAnim.interpolate({
                                        inputRange: [0, 100],
                                        outputRange: ['0%', '100%'],
                                    }),
                                },
                            ]}
                        />
                    </View>
                    <Text style={[styles.legendPct, { color: item.color }]}>{pct}%</Text>
                </View>
            </View>
        </FadeIn>
    );
};

// ── Skeleton ──────────────────────────────────────────
const Skeleton = ({ w, h, radius = 8, mb = 0 }) => {
    const pulse = useRef(new Animated.Value(0.5)).current;
    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
                Animated.timing(pulse, { toValue: 0.5, duration: 700, useNativeDriver: true }),
            ])
        ).start();
    }, []);
    return (
        <Animated.View
            style={{
                width: w, height: h, borderRadius: radius,
                backgroundColor: C.muted, opacity: pulse, marginBottom: mb,
            }}
        />
    );
};

// ── Main Screen ───────────────────────────────────────
const StatisticsScreen = ({ navigation }) => {
    const theme = useTheme();

    const [loading, setLoading] = useState(true);
    const [chartData, setChartData] = useState([]);
    const [filter, setFilter] = useState('month');
    const user = auth.currentUser;

    const colors = {
        bg: theme.colors.background,
        surface: theme.colors.surface,
        text: theme.colors.onSurface,
        sub: theme.colors.onSurfaceVariant,
        border: theme.colors.outlineVariant,
        accent: theme.colors.primary,
        // Giữ các màu chart làm điểm nhấn, nhưng có thể điều chỉnh độ sáng nếu muốn
        chartColors: ['#3B6FF0', '#10B981', '#F472B6', '#F59E0B', '#8B5CF6', '#FB923C'],
    };
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            if (!user) {
                console.log("Đang đợi user hoặc chưa đăng nhập...");
                setLoading(false);
                return;
            }

            // Chọn hàm tính range dựa trên state 'filter'
            const range =
                filter === 'month' ? getMonthRange() :
                    filter === 'quarter' ? getQuarterRange() :
                        getYearRange();

            try {
                const q = query(
                    collection(db, 'transactions'),
                    where('userId', '==', user.uid),
                    where('type', '==', 'expense'),
                    where('date', '>=', Timestamp.fromDate(range.start)),
                    where('date', '<=', Timestamp.fromDate(range.end))
                );

                const snap = await getDocs(q);
                const totals = {};

                snap.forEach((doc) => {
                    const { category, amount } = doc.data();
                    // Gom nhóm số tiền theo danh mục
                    totals[category] = (totals[category] || 0) + amount;
                });

                const formatted = Object.keys(totals).map((key, i) => ({
                    name: key,
                    amount: totals[key],
                    color: C.chartColors[i % C.chartColors.length],
                    legendFontColor: C.sub,
                    legendFontSize: 12,
                }));

                setChartData(formatted);
            } catch (e) {
                console.error("❌ Lỗi truy vấn Firestore:", e);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [filter, user]);

    const total = chartData.reduce((s, d) => s + d.amount, 0);
    const sorted = [...chartData].sort((a, b) => b.amount - a.amount);
    const top = sorted[0] || null;

    return (
        <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
            {/* ── Filter Bar ── */}
            <View style={[styles.tabFilter, { backgroundColor: theme.colors.surfaceVariant }]}>
                {['month', 'quarter', 'year'].map((item) => (
                    <TouchableOpacity
                        key={item}
                        onPress={() => setFilter(item)}
                        style={[
                            styles.tabBtn,
                            filter === item && { backgroundColor: theme.colors.elevation.level3, elevation: 2 }
                        ]}
                    >
                        <Text style={[
                            styles.tabText,
                            { color: filter === item ? theme.colors.primary : theme.colors.onSurfaceVariant }
                        ]}>
                            {item === 'month' ? 'Tháng' : item === 'quarter' ? 'Quý' : 'Năm'}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

                {/* ── Header ── */}
                <FadeIn delay={0}>
                    <View style={styles.header}>
                        <View>
                            <Text style={[styles.headerEyebrow, { color: colors.sub }]}>
                                {filter === 'month' ? 'THÁNG NÀY' : filter === 'quarter' ? 'QUÝ NÀY' : 'NĂM NAY'}
                            </Text>
                            <Text style={[styles.headerTitle, { color: colors.text }]}>Phân tích{'\n'}chi tiêu</Text>
                        </View>
                        <View style={[styles.headerIconBox, { backgroundColor: theme.colors.primaryContainer, borderColor: theme.colors.primary }]}>
                            <Text style={{ fontSize: 28 }}>📊</Text>
                        </View>
                    </View>
                </FadeIn>

                {loading ? (
                    <View style={{ gap: 16 }}>
                        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                            <Skeleton w="100%" h={200} radius={14} mb={20} />
                            <Skeleton w="70%" h={14} radius={6} mb={12} />
                        </View>
                    </View>
                ) : chartData.length === 0 ? (
                    <FadeIn delay={80}>
                        <View style={[styles.card, styles.emptyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                            <Text style={{ fontSize: 48, marginBottom: 16 }}>🧾</Text>
                            <Text style={[styles.emptyTitle, { color: colors.text }]}>Chưa có dữ liệu</Text>
                            <Text style={[styles.emptySub, { color: colors.sub }]}>Bắt đầu ghi chép chi tiêu để xem thống kê.</Text>
                        </View>
                    </FadeIn>
                ) : (
                    <>
                        {/* ── Summary Row ── */}
                        <FadeIn delay={80}>
                            <View style={styles.summaryRow}>
                                <View style={[styles.summaryCard, { backgroundColor: theme.colors.secondaryContainer, borderColor: theme.colors.secondary }]}>
                                    <Text style={[styles.summaryLabel, { color: theme.colors.onSecondaryContainer }]}>Tổng chi</Text>
                                    <Text style={[styles.summaryValue, { color: theme.colors.secondary }]}>{formatVND(total)}đ</Text>
                                </View>
                                <View style={[styles.summaryCard, { backgroundColor: theme.colors.errorContainer, borderColor: theme.colors.error }]}>
                                    <Text style={[styles.summaryLabel, { color: theme.colors.onErrorContainer }]}>Nhiều nhất</Text>
                                    <Text style={[styles.summaryValue, { color: theme.colors.error }]} numberOfLines={1}>{top?.name ?? '—'}</Text>
                                </View>
                            </View>
                        </FadeIn>

                        {/* ── Pie Chart Card ── */}
                        <FadeIn delay={160}>
                            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                                <View style={styles.cardHeader}>
                                    <Text style={[styles.cardTitle, { color: colors.text }]}>Tỷ lệ danh mục</Text>
                                    <View style={[styles.iconPill, { backgroundColor: theme.colors.tertiaryContainer }]}>
                                        <Text style={{ fontSize: 13 }}>🥧</Text>
                                    </View>
                                </View>
                                <PieChart
                                    data={chartData}
                                    width={width - 48}
                                    height={210}
                                    chartConfig={{
                                        color: (opacity = 1) => colors.text, // Chữ trên chart theo theme
                                    }}
                                    accessor="amount"
                                    backgroundColor="transparent"
                                    paddingLeft="10"
                                    hasLegend={false}
                                    absolute
                                />
                                {/* Legend pill list */}
                                <View style={styles.pillLegend}>
                                    {chartData.map((d, i) => (
                                        <View key={i} style={[styles.pillItem, { borderColor: d.color + '77', backgroundColor: d.color + '22' }]}>
                                            <View style={[styles.pillDot, { backgroundColor: d.color }]} />
                                            <Text style={[styles.pillLabel, { color: d.color }]} numberOfLines={1}>{d.name}</Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        </FadeIn>

                        {/* ── Detail Card ── */}
                        <FadeIn delay={240}>
                            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                                <View style={styles.cardHeader}>
                                    <Text style={[styles.cardTitle, { color: colors.text }]}>Chi tiết danh mục</Text>
                                    <View style={[styles.iconPill, { backgroundColor: theme.colors.secondaryContainer }]}>
                                        <Text style={{ fontSize: 13 }}>📋</Text>
                                    </View>
                                </View>
                                {sorted.map((item, i) => (
                                    <LegendItem key={i} item={item} total={total} index={i} />
                                ))}
                            </View>
                        </FadeIn>
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

// ── Styles ────────────────────────────────────────────
const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: C.bg,
    },
    scroll: {
        padding: 20,
        paddingBottom: 48,
        gap: 16,
    },

    /* Header */
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 4,
    },
    headerEyebrow: {
        fontSize: 11,
        color: C.sub,
        fontWeight: '700',
        letterSpacing: 1.5,
        marginBottom: 4,
    },
    headerTitle: {
        fontSize: 30,
        fontWeight: '800',
        color: C.text,
        letterSpacing: -0.5,
        lineHeight: 36,
    },
    headerIconBox: {
        width: 54,
        height: 54,
        borderRadius: 16,
        backgroundColor: C.accentLight,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#C7D7FC',
    },

    /* Summary */
    summaryRow: {
        flexDirection: 'row',
        gap: 10,
    },
    summaryCard: {
        flex: 1,
        borderRadius: 14,
        padding: 14,
        borderWidth: 1,
    },
    summaryLabel: {
        fontSize: 10,
        color: C.sub,
        fontWeight: '700',
        letterSpacing: 0.8,
        textTransform: 'uppercase',
        marginBottom: 6,
    },
    summaryValue: {
        fontSize: 15,
        fontWeight: '800',
        letterSpacing: -0.2,
    },

    /* Card */
    card: {
        backgroundColor: C.card,
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: C.border,
        shadowColor: '#6B7280',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.07,
        shadowRadius: 10,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 18,
    },
    cardTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: C.text,
    },
    iconPill: {
        width: 32,
        height: 32,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },

    /* Pill legend */
    pillLegend: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 14,
    },
    pillItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 20,
        borderWidth: 1,
    },
    pillDot: {
        width: 7,
        height: 7,
        borderRadius: 4,
    },
    pillLabel: {
        fontSize: 11,
        fontWeight: '700',
        maxWidth: 70,
    },

    /* Legend rows */
    legendRow: {
        flexDirection: 'row',
        alignItems: 'stretch',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: C.border,
        gap: 12,
    },
    legendColorBar: {
        width: 4,
        borderRadius: 2,
        minHeight: 52,
    },
    legendMeta: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    legendName: {
        fontSize: 14,
        fontWeight: '600',
        color: C.text,
    },
    legendAmount: {
        fontSize: 14,
        fontWeight: '700',
        color: C.text,
    },
    trackBg: {
        height: 5,
        backgroundColor: C.muted,
        borderRadius: 3,
        overflow: 'hidden',
        marginBottom: 5,
    },
    trackFill: {
        height: '100%',
        borderRadius: 3,
    },
    legendPct: {
        fontSize: 11,
        fontWeight: '700',
    },

    /* Empty */
    emptyCard: {
        alignItems: 'center',
        paddingVertical: 52,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: C.text,
        marginBottom: 8,
    },
    emptySub: {
        fontSize: 14,
        color: C.sub,
        textAlign: 'center',
        lineHeight: 22,
        maxWidth: 260,
    },
    tabFilter: {
        flexDirection: 'row',
        backgroundColor: '#E5E7EB',
        marginHorizontal: 20,
        marginTop: 10,
        borderRadius: 12,
        padding: 4,
    },
    tabBtn: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 10,
    },
    tabBtnActive: {
        backgroundColor: '#FFFFFF',
        elevation: 2,
    },
    tabText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#6B7280',
    },
    tabTextActive: {
        color: '#3B6FF0',
    },
});

export default StatisticsScreen;