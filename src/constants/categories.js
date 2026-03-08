export const CATEGORY_CONFIG = {
    // Nhóm Chi tiêu (Expense)
    'Ăn uống': { icon: 'food-fork-drink', color: '#FF9500', label: 'Ăn uống', type: 'expense' },
    'Di chuyển': { icon: 'car', color: '#007AFF', label: 'Di chuyển', type: 'expense' },
    'Mua sắm': { icon: 'cart', color: '#5856D6', label: 'Mua sắm', type: 'expense' },
    'Giải trí': { icon: 'controller-classic', color: '#FF2D55', label: 'Giải trí', type: 'expense' },
    'Sức khỏe': { icon: 'medical-bag', color: '#34C759', label: 'Sức khỏe', type: 'expense' },
    'Hóa đơn': { icon: 'receipt', color: '#FF9500', label: 'Hóa đơn', type: 'expense' },
    'Giáo dục': { icon: 'school', color: '#5AC8FA', label: 'Giáo dục', type: 'expense' },

    // Nhóm Thu nhập (Income)
    'Lương': { icon: 'cash-multiple', color: '#34C759', label: 'Lương', type: 'income' },
    'Thưởng': { icon: 'gift', color: '#FF9500', label: 'Thưởng', type: 'income' },
    'Đầu tư': { icon: 'chart-line', color: '#5AC8FA', label: 'Đầu tư', type: 'income' },
    'Bán hàng': { icon: 'storefront', color: '#5856D6', label: 'Bán hàng', type: 'income' },

    // Mặc định (Tránh lỗi app bị văng)
    'Khác': { icon: 'dots-horizontal-circle', color: '#8E8E93', label: 'Khác', type: 'expense' },
    'default': { icon: 'help-circle', color: '#8E8E93', label: 'Khác', type: 'expense' }
};