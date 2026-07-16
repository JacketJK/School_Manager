/* =========================================================
   Class Room Manager — app logic
   Data is persisted to localStorage so everything you add,
   edit, complete, or delete is still there after a refresh.
   ========================================================= */

// Unregister stale service workers that may interfere from other projects on the same origin/port
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(function(registrations) {
        for (let registration of registrations) {
            registration.unregister();
        }
    }).catch(function(err) {
        console.warn('Service Worker unregistration failed: ', err);
    });
}

const STORAGE_KEY = 'crm_data_v1';

const defaultData = () => ({
    subjects: ['ภาษาไทย', 'คณิตศาสตร์', 'ภาษาอังกฤษ', 'วิทยาศาสตร์', 'สังคมศึกษา'],
    grades: {
        'ภาษาไทย': { previous: 66, current: 50 },
        'คณิตศาสตร์': { previous: 83, current: 52 },
        'ภาษาอังกฤษ': { previous: 78, current: 45 },
        'วิทยาศาสตร์': { previous: 65, current: 32 },
        'สังคมศึกษา': { previous: 80, current: 60 },
    },
    homework: [
        { id: 'hw1', subject: 'คณิตศาสตร์', title: 'ความสัมพันธ์ระหว่าง ห.ร.ม. กับ ค.ร.น.', detail: 'ทำแบบฝึกหัดข้อ 1-10 เรื่องความสัมพันธ์ระหว่าง ห.ร.ม. กับ ค.ร.น. ของจำนวนนับ 2 จำนวน', due: 'today', done: false, classRoomId: 'c_p6_1', completedBy: [] },
        { id: 'hw2', subject: 'ภาษาไทย', title: 'คัดลายมือบทอาขยาน', detail: 'คัดบทอาขยานที่กำหนดให้ลงสมุด 1 หน้า', due: 'today', done: true, classRoomId: 'c_p6_1', completedBy: ['u_student1'] },
        { id: 'hw3', subject: 'ภาษาอังกฤษ', title: 'แบบฝึกหัด Unit 5', detail: 'ทำแบบฝึกหัดคำศัพท์ Unit 5 หน้า 22-23', due: 'tomorrow', done: false, classRoomId: 'c_p6_1', completedBy: [] },
        { id: 'hw4', subject: 'วิทยาศาสตร์', title: 'รายงานการทดลอง', detail: 'สรุปผลการทดลองเรื่องการเปลี่ยนแปลงของสาร', due: 'tomorrow', done: false, classRoomId: 'c_p6_1', completedBy: [] },
    ],
    points: 150,
    purchasedItems: {},
    studentName: 'เด็กชายจักรกฤษณ์ หวังสุข',
    studentClass: 'นักเรียน ชั้นประถมศึกษาปีที่ 6',
    studentPhoto: 'https://cdn.jsdelivr.net/gh/JacketJK/image/student.png',
    darkMode: false,
    accentColor: '#091e21',
    activities: [
        {
            id: 'act1',
            type: 'ประชุม',
            title: 'กีฬาสี',
            time: '16.00 น.',
            creatorName: 'สภานักเรียน',
            creatorImg: 'https://cdn.jsdelivr.net/gh/JacketJK/image/logo-Project.png',
            detail: 'ประชุมเพื่อวางแผนการจัดงานกีฬาสีประจำปี และแบ่งหน้าที่ความรับผิดชอบของแต่ละฝ่ายในการเตรียมงาน ณ ห้องสภานักเรียนชั้น 3 เพื่อให้การดำเนินงานเป็นไปด้วยความเรียบร้อยและสนุกสนานสำหรับนักเรียนทุกคน',
            image: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=600&q=80',
            participants: []
        },
        {
            id: 'act2',
            type: 'กิจกรรม',
            title: 'วันภาษาไทย',
            time: '10.00 น.',
            creatorName: 'โรงเรียน',
            creatorImg: 'https://cdn.jsdelivr.net/gh/JacketJK/image/logo-Project.png',
            detail: 'กิจกรรมวันภาษาไทยแห่งชาติ มีการประกวดแต่งคำประพันธ์ คัดลายมือ และบูธกิจกรรมอนุรักษ์ภาษาไทย ณ หอประชุมใหญ่ ร่วมสนุกเพื่อลุ้นรับของรางวัลพิเศษและคะแนนสะสมความประพฤติ',
            image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=600&q=80',
            participants: []
        }
    ],
    portfolio: [
        { id: 'pf1', title: 'แบบจำลองระบบสุริยะ', category: 'วิทยาศาสตร์', detail: 'โครงงานจำลองดวงดาวและวงโคจร ผลงานเด่นได้รับคะแนนเต็ม 10 คะแนน', img: 'https://cdn.jsdelivr.net/gh/JacketJK/image/logo-Project.png' },
        { id: 'pf2', title: 'เกียรติบัตรการคัดลายมือไทย', category: 'ภาษาไทย', detail: 'ชนะเลิศอันดับที่ 2 การประกวดคัดลายมือระดับโรงเรียน วันสุนทรภู่', img: 'https://cdn.jsdelivr.net/gh/JacketJK/image/logo-Project.png' }
    ],
    announcements: [
        {
            id: 'ann1',
            title: 'เข้าร่วมกิจกรรมวันภาษาไทย',
            detail: 'ขอเชิญชวนนักเรียนทุกคนเข้าร่วมกิจกรรมวันภาษาไทยแห่งชาติ ในวันที่ 26 มิถุนายน 2567 ณ หอประชุมประจำโรงเรียน เวลา 10:00 นาฬิกา หากนักเรียนคนไหนไม่สามารถเข้าร่วมได้ ให้มารายงานตัวกับครูประจำชั้นเพื่อแจ้งเหตุผลความจำเป็น',
            senderName: 'ครูสมศรี ดีใจ',
            senderImg: 'https://cdn.jsdelivr.net/gh/JacketJK/image/user-1.png',
            type: 'acknowledge',
            acknowledged: false,
            scope: 'class',
            classRoomId: 'c_p6_1'
        },
        {
            id: 'ann2',
            title: 'โหวตเมนูอาหารกลางวันสัปดาห์หน้า',
            detail: 'นักเรียนสามารถช่วยกันเลือกเมนูอาหารกลางวันพิเศษที่จะให้บริการในวันศุกร์หน้าได้ โดยเมนูที่มีคะแนนโหวตสูงสุดจะได้รับการจัดเตรียมโดยแม่ครัวของโรงเรียนค่ะ',
            senderName: 'ครูวรรณา สวยงาม',
            senderImg: 'https://cdn.jsdelivr.net/gh/JacketJK/image/user-30.png',
            type: 'vote',
            options: ['ข้าวมันไก่ผสม', 'ข้าวหมูแดงไข่ต้ม', 'ราเมนซุปกระดูกหมู'],
            votes: {
                'ข้าวมันไก่ผสม': 12,
                'ข้าวหมูแดงไข่ต้ม': 8,
                'ราเมนซุปกระดูกหมู': 15
            },
            voted: false,
            userVote: null,
            scope: 'school'
        },
        {
            id: 'ann3',
            title: 'แจ้งปิดปรับปรุงสระว่ายน้ำชั่วคราว',
            detail: 'ขอแจ้งปิดปรับปรุงระบบกรองน้ำและทำความสะอาดสระว่ายน้ำโรงเรียน ตั้งแต่วันที่ 15 - 20 กรกฎาคมนี้ งดวิชาพลศึกษาทางน้ำทั้งหมดในช่วงเวลาดังกล่าว',
            senderName: 'ครูประหยัด เรียนดี',
            senderImg: 'https://cdn.jsdelivr.net/gh/JacketJK/image/user-2.png',
            type: 'acknowledge',
            acknowledged: false,
            scope: 'school'
        }
    ],
    users: [
        { id: 'u_student1', name: 'เด็กชายจักรกฤษณ์ หวังสุข', username: 'student1', password: 'password', role: 'student', classRoomId: 'c_p6_1', photo: 'https://cdn.jsdelivr.net/gh/JacketJK/image/student.png' },
        { id: 'u_student2', name: 'เด็กชายชินกฤต สุขใจ', username: 'student2', password: 'password', role: 'student', classRoomId: 'c_p6_1', photo: 'https://cdn.jsdelivr.net/gh/JacketJK/image/student.png' },
        { id: 'u_student3', name: 'เด็กหญิงมลฤดี เรียนเก่ง', username: 'student3', password: 'password', role: 'student', classRoomId: 'c_p6_1', photo: 'https://cdn.jsdelivr.net/gh/JacketJK/image/user-30.png' },
        { id: 'u_teacher_sub1', name: 'ครูประหยัด เรียนดี', username: 'teacher1', password: 'password', role: 'subject_teacher', subjects: ['คณิตศาสตร์'], classRooms: ['ป.6/1'], photo: 'https://cdn.jsdelivr.net/gh/JacketJK/image/user-2.png' },
        { id: 'u_teacher_sub2', name: 'ครูสมศักดิ์ คิดดี', username: 'teacher2', password: 'password', role: 'subject_teacher', subjects: ['วิทยาศาสตร์'], classRooms: ['ป.6/1'], photo: 'https://cdn.jsdelivr.net/gh/JacketJK/image/user-2.png' },
        { id: 'u_teacher_home1', name: 'ครูสมศรี ดีใจ', username: 'teacher_home', password: 'password', role: 'homeroom_teacher', subjects: ['ภาษาไทย'], classRooms: ['ป.6/1'], photo: 'https://cdn.jsdelivr.net/gh/JacketJK/image/user-1.png' },
        { id: 'u_academic', name: 'ครูอัญชลี วิชาการ', username: 'academic', password: 'password', role: 'academic_affairs', photo: 'https://cdn.jsdelivr.net/gh/JacketJK/image/user-30.png' },
        { id: 'u_discipline', name: 'ครูสุชาติ วินัยดี', username: 'discipline', password: 'password', role: 'discipline_affairs', photo: 'https://cdn.jsdelivr.net/gh/JacketJK/image/user-2.png' },
        { id: 'u_admin', name: 'แอดมินระบบ สูงสุด', username: 'admin', password: 'password', role: 'admin', photo: 'https://cdn.jsdelivr.net/gh/JacketJK/image/logo-Project.png' }
    ],
    classRooms: [
        { id: 'c_p6_1', name: 'ป.6/1', homeroomTeacherId: 'u_teacher_home1', studentIds: ['u_student1', 'u_student2', 'u_student3'] }
    ],
    studentGrades: {
        'u_student1': {
            'ภาษาไทย': { previous: 66, current: 50 },
            'คณิตศาสตร์': { previous: 83, current: 52 },
            'ภาษาอังกฤษ': { previous: 78, current: 45 },
            'วิทยาศาสตร์': { previous: 65, current: 32 },
            'สังคมศึกษา': { previous: 80, current: 60 }
        },
        'u_student2': {
            'ภาษาไทย': { previous: 70, current: 65 },
            'คณิตศาสตร์': { previous: 75, current: 70 },
            'ภาษาอังกฤษ': { previous: 80, current: 75 },
            'วิทยาศาสตร์': { previous: 70, current: 68 },
            'สังคมศึกษา': { previous: 82, current: 80 }
        },
        'u_student3': {
            'ภาษาไทย': { previous: 85, current: 90 },
            'คณิตศาสตร์': { previous: 90, current: 95 },
            'ภาษาอังกฤษ': { previous: 88, current: 92 },
            'วิทยาศาสตร์': { previous: 85, current: 89 },
            'สังคมศึกษา': { previous: 92, current: 94 }
        }
    },
    behaviorLogs: [
        { id: 'beh1', studentId: 'u_student1', studentName: 'เด็กชายจักรกฤษณ์ หวังสุข', points: 10, reason: 'ช่วยเหลืองานครูจัดห้องเรียน', date: '2026-07-10', createdBy: 'ครูสมศรี ดีใจ' },
        { id: 'beh2', studentId: 'u_student1', studentName: 'เด็กชายจักรกฤษณ์ หวังสุข', points: -5, reason: 'ส่งงานล่าช้ากว่ากำหนด', date: '2026-07-11', createdBy: 'ครูประหยัด เรียนดี' },
        { id: 'beh3', studentId: 'u_student2', studentName: 'เด็กชายชินกฤต สุขใจ', points: 15, reason: 'เป็นหัวหน้าห้องนำสวดมนต์และดูแลความสงบเรียบร้อย', date: '2026-07-12', createdBy: 'ครูสมศรี ดีใจ' }
    ],
    attendance: [
        { id: 'att1', date: '2026-07-10', studentId: 'u_student1', studentName: 'เด็กชายจักรกฤษณ์ หวังสุข', status: 'present' },
        { id: 'att2', date: '2026-07-10', studentId: 'u_student2', studentName: 'เด็กชายชินกฤต สุขใจ', status: 'present' },
        { id: 'att3', date: '2026-07-10', studentId: 'u_student3', studentName: 'เด็กหญิงมลฤดี เรียนเก่ง', status: 'present' },
        { id: 'att4', date: '2026-07-13', studentId: 'u_student1', studentName: 'เด็กชายจักรกฤษณ์ หวังสุข', status: 'present' },
        { id: 'att5', date: '2026-07-13', studentId: 'u_student2', studentName: 'เด็กชายชินกฤต สุขใจ', status: 'late' },
        { id: 'att6', date: '2026-07-13', studentId: 'u_student3', studentName: 'เด็กหญิงมลฤดี เรียนเก่ง', status: 'sick' }
    ],
    messages: [
        { id: 'msg_1', senderName: 'ครูสมศรี ดีใจ', senderImg: 'https://cdn.jsdelivr.net/gh/JacketJK/image/user-1.png', preview: 'อย่าลืมทำการบ้านคัดลายมือบทอาขยานส่งพรุ่งนี้นะคะ', time: '15 นาทีที่แล้ว', read: false },
        { id: 'msg_2', senderName: 'เด็กหญิงมลฤดี เรียนเก่ง', senderImg: 'https://cdn.jsdelivr.net/gh/JacketJK/image/user-30.png', preview: 'ข้อ 5 วิชาคณิตคิดยังไงเหรอ?', time: '3 ชั่วโมงที่แล้ว', read: false },
        { id: 'msg_3', senderName: 'ครูประหยัด เรียนดี', senderImg: 'https://cdn.jsdelivr.net/gh/JacketJK/image/user-2.png', preview: 'พรุ่งนี้เตรียมสมุดเลขเล่มหนามาด้วยนะครับ', time: '2 วันที่แล้ว', read: true }
    ],
    notifications: [
        { id: 'notif_1', title: 'การบ้านใหม่', desc: 'มีงานมอบหมายใหม่ในวิชา คณิตศาสตร์: ความสัมพันธ์ระหว่าง ห.ร.ม. กับ ค.ร.น.', time: '10 นาทีที่แล้ว', read: false, type: 'homework', refId: 'hw1' },
        { id: 'notif_2', title: 'ประกาศใหม่', desc: 'ครูสมศรี ดีใจ ได้เพิ่มประกาศใหม่: เข้าร่วมกิจกรรมวันภาษาไทย', time: '1 ชั่วโมงที่แล้ว', read: false, type: 'announcement', refId: 'ann1' },
        { id: 'notif_3', title: 'ประกาศผลคะแนนสอบ', desc: 'ผลคะแนนวิชา ภาษาอังกฤษ ได้รับการอัปเดตแล้ว', time: '1 วันที่แล้ว', read: true, type: 'grade', refId: 'english' }
    ],
    currentUser: null
});

let state = loadData();

function loadData() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return defaultData();
        const parsed = JSON.parse(raw);
        if (!parsed.subjects || !parsed.grades || !parsed.homework) return defaultData();

        // Upgrade older schema dynamically
        const defaults = defaultData();
        parsed.points = parsed.points !== undefined ? parsed.points : defaults.points;
        parsed.purchasedItems = parsed.purchasedItems || defaults.purchasedItems;
        parsed.studentName = parsed.studentName || defaults.studentName;
        parsed.studentClass = parsed.studentClass || defaults.studentClass;
        parsed.studentPhoto = parsed.studentPhoto || defaults.studentPhoto;
        parsed.darkMode = parsed.darkMode !== undefined ? parsed.darkMode : defaults.darkMode;
        parsed.accentColor = parsed.accentColor || defaults.accentColor;
        parsed.portfolio = parsed.portfolio || defaults.portfolio;
        parsed.announcements = parsed.announcements || defaults.announcements;
        parsed.activities = parsed.activities || defaults.activities;

        // Upgrade users & roles schemas
        parsed.users = parsed.users || defaults.users;
        parsed.classRooms = parsed.classRooms || defaults.classRooms;
        parsed.studentGrades = parsed.studentGrades || defaults.studentGrades;
        parsed.behaviorLogs = parsed.behaviorLogs || defaults.behaviorLogs;
        parsed.attendance = parsed.attendance || defaults.attendance;
        parsed.messages = parsed.messages || defaults.messages;
        parsed.notifications = parsed.notifications || defaults.notifications;
        parsed.currentUser = parsed.currentUser || defaults.currentUser;

        return parsed;
    } catch (e) {
        console.error('Failed to load saved data, resetting.', e);
        return defaultData();
    }
}

function saveData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function uid() {
    return 'id' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

/* ---------------- UI state (not persisted) ---------------- */
let activeDueTab = 'today';   // 'today' | 'tomorrow'
let activeSubjectFilter = 'all';
let searchQuery = '';
let currentView = 'home';
let calendarDate = new Date();
let activeTimeframeFilter = 'month'; // 'today' | 'week' | 'month'

// Shop Items definitions
const shopItems = [
    { id: 'fancy_pencil', name: 'ดินสอไม้แฟนซี', desc: 'ดินสอไม้ลวดลายการ์ตูนสุดน่ารัก', price: 100, icon: '✏️' },
    { id: 'pastel_notebook', name: 'สมุดบันทึกสีพาสเทล', desc: 'สมุดจดหนา 80 หน้า ปกสีพาสเทลเรียบหรู', price: 250, icon: '📓' },
    { id: 'cat_stickers', name: 'สติกเกอร์น้องแมวสุดคิ้วท์', desc: 'ชุดสติกเกอร์ 15 ชิ้นลายน้องแมวกันน้ำ', price: 50, icon: '🐱' },
    { id: 'hw_pass', name: 'คูปองข้ามการบ้าน 1 ครั้ง', desc: 'สิทธิ์ข้ามการบ้านหนึ่งชิ้นในวิชาใดก็ได้', price: 1000, icon: '🎟️' },
    { id: 'presentation_first', name: 'สิทธิ์นำเสนอรายงานคนแรก', desc: 'ไม่ต้องตื่นเต้นรอคิว แลกสิทธิ์นำเสนอก่อนใคร', price: 500, icon: '🎤' },
    { id: 'cocoa_voucher', name: 'โกโก้ร้อนฟรีที่สหกรณ์', desc: 'คูปองแลกเครื่องดื่มอุ่นๆ ฟรี 1 แก้ว', price: 400, icon: '☕' }
];

// Teachers & Classmates definitions
const teachers = [
    { name: 'ครูสมศรี ดีใจ', subject: 'ภาษาไทย', role: 'คุณครูประจำชั้น ป.6/1', img: 'https://cdn.jsdelivr.net/gh/JacketJK/image/user-1.png' },
    { name: 'ครูประหยัด เรียนดี', subject: 'คณิตศาสตร์', role: 'หัวหน้ากลุ่มวิชาคำนวณ', img: 'https://cdn.jsdelivr.net/gh/JacketJK/image/user-2.png' },
    { name: 'ครูวรรณา สวยงาม', subject: 'ภาษาอังกฤษ', role: 'อาจารย์ภาษาต่างประเทศ', img: 'https://cdn.jsdelivr.net/gh/JacketJK/image/user-30.png' },
    { name: 'ครูสมศักดิ์ คิดดี', subject: 'วิทยาศาสตร์', role: 'อาจารย์พิเศษฝ่ายวิจัยการทดลอง', img: 'https://cdn.jsdelivr.net/gh/JacketJK/image/user-2.png' }
];

const classmates = [
    { name: 'เด็กชายชินกฤต สุขใจ', role: 'หัวหน้าห้อง', img: 'https://cdn.jsdelivr.net/gh/JacketJK/image/student.png' },
    { name: 'เด็กหญิงมลฤดี เรียนเก่ง', role: 'รองหัวหน้าห้อง', img: 'https://cdn.jsdelivr.net/gh/JacketJK/image/user-30.png' },
    { name: 'เด็กชายปณิธาน ทนทาน', role: 'สมาชิก', img: 'https://cdn.jsdelivr.net/gh/JacketJK/image/student.png' },
    { name: 'เด็กหญิงกมลวรรณ งามยิ่ง', role: 'สมาชิก', img: 'https://cdn.jsdelivr.net/gh/JacketJK/image/user-1.png' },
    { name: 'เด็กชายอนันต์ สุขสบาย', role: 'สมาชิก', img: 'https://cdn.jsdelivr.net/gh/JacketJK/image/student.png' }
];

/* ============================================================
   Sidebar / dropdown / nav toggles (original behaviour, kept)
   ============================================================ */
document.querySelector('.btn-main-sidebar').addEventListener('click', () => {
    const sidebar = document.querySelector('.sidebar-manu');
    const container = document.querySelector('.contianer-fluid');
    const icon = document.querySelector('.btn-main-sidebar i');

    sidebar.classList.toggle('expanded');
    container.classList.toggle('sidebar-collapsed', !sidebar.classList.contains('expanded'));

    if (sidebar.classList.contains('expanded')) {
        icon.classList.replace('bi-grid', 'bi-list-ul');
    } else {
        icon.classList.replace('bi-list-ul', 'bi-grid');
    }
});

document.addEventListener('DOMContentLoaded', function () {
    // Dropdown toggle functionality for all dropdowns (Profile, Messages, Notifications)
    document.querySelectorAll('.dropdown').forEach(dropdown => {
        const btn = dropdown.querySelector('.dropbtn');
        const content = dropdown.querySelector('.dropdown-content');
        if (btn && content) {
            btn.addEventListener('click', function (e) {
                e.stopPropagation();
                // Close other dropdowns
                document.querySelectorAll('.dropdown-content').forEach(c => {
                    if (c !== content) c.classList.remove('show');
                });
                content.classList.toggle('show');
            });
        }
    });

    // Close dropdowns on outside click
    window.addEventListener('click', function (event) {
        if (!event.target.closest('.dropdown')) {
            document.querySelectorAll('.dropdown-content').forEach(c => {
                c.classList.remove('show');
            });
        }
    });

    // Mark messages as read button
    const markMsgsBtn = document.getElementById('mark-messages-read');
    if (markMsgsBtn) {
        markMsgsBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            state.messages.forEach(m => m.read = true);
            saveData();
            renderTopBarMenus();
        });
    }

    // Mark notifications as read button
    const markNotifsBtn = document.getElementById('mark-notifications-read');
    if (markNotifsBtn) {
        markNotifsBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            state.notifications.forEach(n => n.read = true);
            saveData();
            renderTopBarMenus();
        });
    }

    // Info and Gear routing buttons
    const btnInfo = document.getElementById('btn-info');
    if (btnInfo) {
        btnInfo.addEventListener('click', () => {
            window.location.hash = 'info';
        });
    }

    const btnGear = document.getElementById('btn-gear');
    if (btnGear) {
        btnGear.addEventListener('click', () => {
            window.location.hash = 'settings';
        });
    }

    // Initialize top bar menus
    renderTopBarMenus();
});

const buttons = document.querySelectorAll('.btn-center-nav');
buttons.forEach(button => {
    button.addEventListener('click', () => {
        buttons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        const filterText = button.textContent.trim();
        if (filterText === 'รายงาน') {
            switchView('grades');
        } else {
            if (filterText === 'วันนี้') {
                activeTimeframeFilter = 'today';
            } else if (filterText === 'สัปดาห์นี้') {
                activeTimeframeFilter = 'week';
            } else if (filterText === 'เดือนนี้') {
                activeTimeframeFilter = 'month';
            }
            
            if (currentView !== 'home') {
                switchView('home');
            } else {
                renderHomework();
                renderHomeActivities();
                renderCharts();
                renderAnnouncements();
            }
        }
    });
});

const btnhw = document.querySelectorAll('.btn-home-work');
btnhw.forEach(button => {
    button.addEventListener('click', () => {
        btnhw.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        activeDueTab = button.textContent.trim() === 'พรุ่งนี้' ? 'tomorrow' : 'today';
        renderHomework();
    });
});

/* ============================================================
   Boot & Navigation Router
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
    if (!initSession()) return;

    applyThemeAndProfile();
    updateTime();
    wireModals();
    wireSearch();
    wireNavigation();
    wireAnnouncements();
    wireActivityOffcanvas();

    // Trigger router for initial load
    const initialView = window.location.hash.substring(1) || 'home';
    switchView(initialView);
});

function initSession() {
    const portal = document.getElementById('loginPortal');
    if (!portal) return true;
    
    if (!state.currentUser) {
        portal.style.display = 'flex';
        renderQuickUsers();
        wireLoginForm();
        return false;
    }
    
    portal.style.display = 'none';
    configureSidebarForRole();
    return true;
}

function wireLoginForm() {
    const form = document.getElementById('loginForm');
    if (!form) return;
    form.onsubmit = (e) => {
        e.preventDefault();
        const userVal = document.getElementById('loginUsername').value.trim();
        const passVal = document.getElementById('loginPassword').value.trim();
        
        const found = state.users.find(u => u.username === userVal && u.password === passVal);
        if (found) {
            state.currentUser = found;
            saveData();
            location.reload();
        } else {
            alert('ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง');
        }
    };
}

function renderQuickUsers() {
    const grid = document.getElementById('quickLoginGrid');
    if (!grid) return;
    grid.innerHTML = '';
    
    const sampleUsers = [
        { username: 'student1', name: 'จักรกฤษณ์ (นักเรียน)', role: 'student', photo: 'https://cdn.jsdelivr.net/gh/JacketJK/image/student.png' },
        { username: 'teacher1', name: 'ครูประหยัด (ครูวิชา)', role: 'subject_teacher', photo: 'https://cdn.jsdelivr.net/gh/JacketJK/image/user-2.png' },
        { username: 'teacher_home', name: 'ครูสมศรี (ครูประจำชั้น)', role: 'homeroom_teacher', photo: 'https://cdn.jsdelivr.net/gh/JacketJK/image/user-1.png' },
        { username: 'academic', name: 'ครูอัญชลี (วิชาการ)', role: 'academic_affairs', photo: 'https://cdn.jsdelivr.net/gh/JacketJK/image/user-30.png' },
        { username: 'discipline', name: 'ครูสุชาติ (ปกครอง)', role: 'discipline_affairs', photo: 'https://cdn.jsdelivr.net/gh/JacketJK/image/user-2.png' },
        { username: 'admin', name: 'แอดมินระบบ (สูงสุด)', role: 'admin', photo: 'https://cdn.jsdelivr.net/gh/JacketJK/image/logo-Project.png' }
    ];
    
    sampleUsers.forEach(u => {
        const card = document.createElement('div');
        card.className = 'quick-user-card';
        card.innerHTML = `
            <img src="${u.photo}" alt="${u.name}">
            <div class="quick-user-info">
                <span class="quick-user-name">${u.name}</span>
                <span class="quick-user-role">${u.role}</span>
            </div>
        `;
        card.onclick = () => {
            const found = state.users.find(usr => usr.username === u.username);
            if (found) {
                state.currentUser = found;
                saveData();
                location.reload();
            }
        };
        grid.appendChild(card);
    });
}

function configureSidebarForRole() {
    const role = state.currentUser ? state.currentUser.role : 'student';
    
    // Show role-specific tabs
    document.getElementById('sidebar-academic').style.display = (role === 'admin' || role === 'academic_affairs') ? 'flex' : 'none';
    document.getElementById('sidebar-homeroom').style.display = (role === 'admin' || role === 'homeroom_teacher') ? 'flex' : 'none';
    document.getElementById('sidebar-discipline').style.display = (role === 'admin' || role === 'discipline_affairs') ? 'flex' : 'none';
    document.getElementById('sidebar-admin').style.display = (role === 'admin') ? 'flex' : 'none';
    
    // Dynamic naming for Homework / Grades in Dashboard
    const hwTitle = document.getElementById('homeworkSectionTitle');
    const gradesTitle = document.getElementById('gradesSectionTitle');
    if (hwTitle && gradesTitle) {
        if (role === 'subject_teacher') {
            hwTitle.textContent = 'การบ้านที่มอบหมาย';
            gradesTitle.textContent = 'กรอกคะแนนเก็บวิชาที่สอน';
            document.getElementById('homeClassroomSelectorContainer').style.display = 'block';
        } else if (role === 'student') {
            hwTitle.textContent = 'การบ้านของฉัน';
            gradesTitle.textContent = 'คะแนนเก็บรายวิชา';
            document.getElementById('homeClassroomSelectorContainer').style.display = 'none';
        } else {
            hwTitle.textContent = 'การบ้านระดับห้องเรียน';
            gradesTitle.textContent = 'คะแนนสรุปห้องเรียน';
            document.getElementById('homeClassroomSelectorContainer').style.display = 'block';
        }
    }

    // Hide/show edit grades button (only admin can open global grades editor modal)
    const editGradesBtn = document.getElementById('editGradesBtn');
    if (editGradesBtn) {
        editGradesBtn.style.display = (role === 'admin') ? 'flex' : 'none';
    }

    // Hide/show add homework button based on permission
    const addHomeworkBtn = document.getElementById('addHomeworkBtn');
    if (addHomeworkBtn) {
        addHomeworkBtn.style.display = (role === 'academic_affairs' || role === 'discipline_affairs') ? 'none' : 'flex';
    }

    // Hide/show manage announcements button
    const manageAnnouncementsBtn = document.getElementById('manageAnnouncementsBtn');
    if (manageAnnouncementsBtn) {
        manageAnnouncementsBtn.style.display = (role === 'student') ? 'none' : 'flex';
    }
}

function checkAccess(viewName) {
    if (!state.currentUser) return false;
    const role = state.currentUser.role;
    if (viewName === 'admin' && role !== 'admin') return false;
    if (viewName === 'academic' && role !== 'admin' && role !== 'academic_affairs') return false;
    if (viewName === 'homeroom' && role !== 'admin' && role !== 'homeroom_teacher') return false;
    if (viewName === 'discipline' && role !== 'admin' && role !== 'discipline_affairs') return false;
    return true;
}

function wireNavigation() {
    const viewButtons = document.querySelectorAll('.btn-sidebar');
    viewButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetView = btn.getAttribute('data-view');
            if (targetView) {
                window.location.hash = targetView;
            }
        });
    });

    // Dropdown Profile & Settings links
    const dropProfileBtn = document.getElementById('dropProfileBtn');
    if (dropProfileBtn) {
        dropProfileBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.hash = 'settings';
        });
    }

    const dropSettingsBtn = document.getElementById('dropSettingsBtn');
    if (dropSettingsBtn) {
        dropSettingsBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.hash = 'settings';
        });
    }
    
    // Logout Action
    const dropdownLinks = document.querySelectorAll('.dropdown-content a');
    dropdownLinks.forEach(link => {
        if (link.textContent.includes('ออกจากระบบ')) {
            link.onclick = (e) => {
                e.preventDefault();
                state.currentUser = null;
                saveData();
                location.reload();
            };
        }
    });

    // Go to activities link on Dashboard
    const goToActivitiesBtn = document.getElementById('goToActivitiesBtn');
    if (goToActivitiesBtn) {
        goToActivitiesBtn.addEventListener('click', () => {
            window.location.hash = 'activities';
        });
    }

    // Listen to hash changes for dynamic back/forward and navigation
    window.addEventListener('hashchange', () => {
        const viewName = window.location.hash.substring(1) || 'home';
        switchView(viewName);
    });
}

const loadedViews = {};

async function switchView(viewName) {
    if (!checkAccess(viewName)) {
        window.location.hash = 'home';
        return;
    }
    
    currentView = viewName;

    // Toggle active sidebar button
    document.querySelectorAll('.btn-sidebar').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-view') === viewName);
    });

    // Toggle active center-nav button based on active view and timeframe filter
    const centerButtons = document.querySelectorAll('.btn-center-nav');
    centerButtons.forEach(btn => {
        const text = btn.textContent.trim();
        if (viewName === 'grades') {
            btn.classList.toggle('active', text === 'รายงาน');
        } else if (viewName === 'home') {
            if (activeTimeframeFilter === 'today') {
                btn.classList.toggle('active', text === 'วันนี้');
            } else if (activeTimeframeFilter === 'week') {
                btn.classList.toggle('active', text === 'สัปดาห์นี้');
            } else if (activeTimeframeFilter === 'month') {
                btn.classList.toggle('active', text === 'เดือนนี้');
            }
        } else {
            btn.classList.remove('active');
        }
    });

    // Toggle view visibility
    const pane = document.getElementById(`view-${viewName}`);
    if (pane) {
        if (!loadedViews[viewName]) {
            try {
                const response = await fetch(`views/${viewName}.html`);
                if (response.ok) {
                    const html = await response.text();
                    pane.innerHTML = html;
                    loadedViews[viewName] = true;
                } else {
                    pane.innerHTML = `<div style="padding: 20px; color: red;">ไม่สามารถโหลดหน้านี้ได้ (${response.status})</div>`;
                }
            } catch (err) {
                console.error(err);
                pane.innerHTML = `<div style="padding: 20px; color: red;">เกิดข้อผิดพลาดในการดึงหน้าเว็บ: ${err.message}</div>`;
            }
        }

        document.querySelectorAll('.view-pane').forEach(p => {
            const isActive = p.id === `view-${viewName}`;
            p.classList.toggle('active', isActive);
            if (isActive) {
                p.className = 'view-pane active animate__animated animate__fadeIn';
            } else {
                p.className = 'view-pane';
            }
        });
    }

    // Set page header title
    const titles = {
        home: 'รายงานสรุปการเรียน',
        archive: 'คลังการบ้านที่เสร็จแล้ว',
        shop: 'ร้านค้าของสะสม & รางวัล',
        calendar: 'ปฏิทินส่งการบ้าน',
        grades: 'คะแนนสอบ & เกรดเฉลี่ย',
        people: 'ข้อมูลเพื่อนและอาจารย์',
        activities: 'กิจกรรมยามว่าง & เมนูประจำวัน',
        portfolio: 'แฟ้มสะสมงาน E-Portfolio',
        info: 'เกี่ยวกับระบบจัดห้องเรียน',
        settings: 'ตั้งค่าการใช้งานโปรไฟล์',
        admin: 'จัดการบัญชีผู้ใช้ระบบ',
        academic: 'หลักสูตรและการวิเคราะห์ผลสัมฤทธิ์',
        homeroom: 'บันทึกพฤติกรรมและการเข้าชั้นเรียน',
        discipline: 'รายงานพฤติกรรมฝ่ายปกครอง'
    };
    document.getElementById('pageTitleLabel').textContent = titles[viewName] || 'ระบบบริหารห้องเรียน';

    // Search bar visibility
    const searchBar = document.querySelector('.sup-header .search-box');
    if (searchBar) {
        if (viewName === 'home') {
            searchBar.style.display = 'flex';
        } else {
            searchBar.style.display = 'none';
        }
    }

    // Configure sidebar role settings (in case role-specific elements were loaded)
    configureSidebarForRole();

    // Initialize specific view content
    if (viewName === 'home') {
        const classSel = document.getElementById('homeClassroomSelector');
        if (classSel) {
            populateClassroomSelector();
            classSel.onchange = () => {
                renderHomework();
                renderGrades();
                renderCharts();
            };
        }
        const btnhw = document.querySelectorAll('.btn-home-work');
        btnhw.forEach(button => {
            button.onclick = () => {
                btnhw.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                activeDueTab = button.textContent.trim() === 'พรุ่งนี้' ? 'tomorrow' : 'today';
                renderHomework();
            };
        });
        populateSubjectFilter();
        renderHomework();
        renderGrades();
        renderCharts();
        renderAnnouncements();
        renderHomeActivities();
        const goToActivitiesBtn = document.getElementById('goToActivitiesBtn');
        if (goToActivitiesBtn) {
            goToActivitiesBtn.onclick = () => {
                window.location.hash = 'activities';
            };
        }
    }
    else if (viewName === 'archive') initArchiveView();
    else if (viewName === 'shop') initShopView();
    else if (viewName === 'calendar') initCalendarView();
    else if (viewName === 'grades') initGradesView();
    else if (viewName === 'people') initPeopleView();
    else if (viewName === 'portfolio') initPortfolioView();
    else if (viewName === 'settings') initSettingsView();
    else if (viewName === 'admin') initAdminView();
    else if (viewName === 'academic') initAcademicView();
    else if (viewName === 'homeroom') initHomeroomView();
    else if (viewName === 'discipline') initDisciplineView();
}function applyThemeAndProfile() {
    if (state.currentUser) {
        const u = state.currentUser;
        document.getElementById('headerStudentName').textContent = u.name;
        
        let roleLabel = 'นักเรียน';
        if (u.role === 'admin') roleLabel = 'ผู้ดูแลระบบ';
        else if (u.role === 'subject_teacher') roleLabel = 'ครูประจำวิชา';
        else if (u.role === 'homeroom_teacher') roleLabel = 'ครูประจำชั้น';
        else if (u.role === 'academic_affairs') roleLabel = 'ฝ่ายวิชาการ';
        else if (u.role === 'discipline_affairs') roleLabel = 'ฝ่ายปกครอง';
        
        const classLabel = u.classRoomId ? ' ชั้น ป.6/1' : '';
        document.getElementById('headerStudentClass').textContent = roleLabel + classLabel;
        document.getElementById('headerProfileImage').src = u.photo || 'https://cdn.jsdelivr.net/gh/JacketJK/image/student.png';
    } else {
        document.getElementById('headerStudentName').textContent = state.studentName;
        document.getElementById('headerStudentClass').textContent = state.studentClass;
        document.getElementById('headerProfileImage').src = state.studentPhoto;
    }

    // Apply dark mode
    document.body.classList.toggle('dark-mode', state.darkMode);

    // Apply Accent color
    document.documentElement.style.setProperty('--dark', state.accentColor);
}
/* ============================================================
   Classroom selector dropdown
   ============================================================ */
function populateClassroomSelector() {
    const select = document.getElementById('homeClassroomSelector');
    if (!select) return;
    const currentValue = select.value;
    select.innerHTML = '';

    const role = state.currentUser ? state.currentUser.role : 'student';
    const user = state.currentUser;

    let allowedClassrooms = state.classRooms;

    if (role === 'subject_teacher' || role === 'homeroom_teacher') {
        if (user.classRooms && user.classRooms.length > 0) {
            allowedClassrooms = state.classRooms.filter(c => 
                user.classRooms.includes(c.name) || user.classRooms.includes(c.id)
            );
        }
    } else if (role === 'student') {
        const studentClass = user.classRoomId || 'c_p6_1';
        allowedClassrooms = state.classRooms.filter(c => c.id === studentClass);
    }

    if (allowedClassrooms.length === 0) {
        allowedClassrooms = state.classRooms;
    }

    allowedClassrooms.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.id;
        opt.textContent = `ชั้น ${c.name}`;
        select.appendChild(opt);
    });

    if (currentValue && allowedClassrooms.some(c => c.id === currentValue)) {
        select.value = currentValue;
    } else {
        select.value = allowedClassrooms[0].id;
    }
}

/* ============================================================
   Subject filter dropdown
   ============================================================ */
function populateSubjectFilter() {
    const select = document.getElementById('subjectFilter');
    if (!select) return;
    const currentValue = select.value || 'all';
    select.innerHTML = '<option value="all">ทุกวิชา</option>';
    state.subjects.forEach(subject => {
        const opt = document.createElement('option');
        opt.value = subject;
        opt.textContent = subject;
        select.appendChild(opt);
    });
    select.value = state.subjects.includes(currentValue) ? currentValue : 'all';

    select.addEventListener('change', () => {
        activeSubjectFilter = select.value;
        renderHomework();
    });
}

/* ============================================================
   Search
   ============================================================ */
function wireSearch() {
    const input = document.getElementById('searchInput');
    if (!input) return;
    input.addEventListener('input', () => {
        searchQuery = input.value.trim().toLowerCase();
        renderHomework();
    });
}
/* ============================================================
   Homework rendering
   ============================================================ */
function renderHomework() {
    const list = document.getElementById('homeworkList');
    if (!list) return;
    list.innerHTML = '';

    const role = state.currentUser ? state.currentUser.role : 'student';

    // Apply timeframe filter
    if (activeTimeframeFilter === 'today') {
        activeDueTab = 'today';
        const btnhw = document.querySelectorAll('.btn-home-work');
        btnhw.forEach(btn => {
            const text = btn.textContent.trim();
            btn.classList.toggle('active', text === 'วันนี้');
            btn.style.display = text === 'วันนี้' ? 'inline-block' : 'none';
        });
    } else {
        const btnhw = document.querySelectorAll('.btn-home-work');
        btnhw.forEach(btn => {
            btn.style.display = 'inline-block';
        });
    }

    let items = state.homework;
    if (activeTimeframeFilter === 'today') {
        items = items.filter(hw => hw.due === 'today');
    } else if (activeTimeframeFilter === 'week') {
        items = items.filter(hw => hw.due === 'today' || hw.due === 'tomorrow');
    } else {
        items = items.filter(hw => hw.due === activeDueTab);
    }

    // Filter by classroom according to role
    if (role === 'student') {
        const studentClass = state.currentUser ? state.currentUser.classRoomId : 'c_p6_1';
        items = items.filter(hw => hw.classRoomId === studentClass);
    } else {
        const classSel = document.getElementById('homeClassroomSelector');
        if (classSel) {
            items = items.filter(hw => hw.classRoomId === classSel.value);
        }
    }

    if (activeSubjectFilter !== 'all') {
        items = items.filter(hw => hw.subject === activeSubjectFilter);
    }

    if (searchQuery) {
        items = items.filter(hw =>
            hw.title.toLowerCase().includes(searchQuery) ||
            hw.detail.toLowerCase().includes(searchQuery) ||
            hw.subject.toLowerCase().includes(searchQuery)
        );
    }

    if (items.length === 0) {
        list.innerHTML = '<div class="empty-state">ไม่มีการบ้านในหมวดนี้<br>กดปุ่ม + เพื่อเพิ่มการบ้าน</div>';
        renderCharts();
        return;
    }

    items.forEach(hw => {
        const card = document.createElement('div');
        
        let isDone = false;
        if (role === 'student') {
            isDone = hw.completedBy && hw.completedBy.includes(state.currentUser.id);
        } else {
            isDone = hw.done; // Fallback or general status
        }

        card.className = 'card-container' + (isDone ? ' done' : '');
        card.dataset.id = hw.id;

        const checkIcon = isDone ? 'bi-check-circle-fill' : 'bi-check-circle';
        
        // If teacher or admin, clicking check doesn't toggle completion, it can show who has completed
        let toggleActionHtml = `<i class="bi ${checkIcon}" data-action="toggle"></i>`;
        if (role !== 'student') {
            const completedCount = hw.completedBy ? hw.completedBy.length : 0;
            toggleActionHtml = `<span style="font-size:11px; font-weight:600; color:var(--accent);"><i class="bi bi-people-fill"></i> ${completedCount} คน</span>`;
        }

        card.innerHTML = `
      <div class="card-header">
        <span style="font-size:12px;color:var(--dark-light);align-self:center;">${escapeHtml(hw.subject)}</span>
        ${toggleActionHtml}
      </div>
      <div class="card-title">${escapeHtml(hw.title)}</div>
      <div class="card-detial">${escapeHtml(hw.detail || '')}</div>
    `;

        if (role === 'student') {
            card.querySelector('[data-action="toggle"]').addEventListener('click', (e) => {
                e.stopPropagation();
                hw.completedBy = hw.completedBy || [];
                const idx = hw.completedBy.indexOf(state.currentUser.id);
                if (idx > -1) {
                    hw.completedBy.splice(idx, 1);
                    state.points = Math.max(0, state.points - 50);
                } else {
                    hw.completedBy.push(state.currentUser.id);
                    state.points += 50;
                }
                // Sync legacy field
                hw.done = hw.completedBy.length > 0;

                saveData();
                renderHomework();
            });
        }

        card.addEventListener('click', () => {
            let canEdit = false;
            if (role === 'admin') {
                canEdit = true;
            } else if (role === 'student' && (!hw.createdBy || hw.createdBy === state.currentUser.id)) {
                canEdit = true;
            } else if (role === 'subject_teacher' && state.currentUser.subjects && state.currentUser.subjects.includes(hw.subject)) {
                canEdit = true;
            } else if (role === 'homeroom_teacher' && state.currentUser.classRooms && (state.currentUser.classRooms.includes(hw.classRoomId) || hw.classRoomId === 'c_p6_1')) {
                canEdit = true;
            }
            openHomeworkModal(hw.id, canEdit);
        });

        list.appendChild(card);
    });

    renderCharts();
}
function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

/* ============================================================
   Grades rendering (progress bars)
   ============================================================ */
function renderGrades() {
    const list = document.getElementById('gradesList');
    if (!list) return;
    list.innerHTML = '';

    const role = state.currentUser ? state.currentUser.role : 'student';

    if (role === 'student') {
        const studentId = state.currentUser.id;
        const grades = state.studentGrades[studentId] || {};
        state.subjects.forEach(subject => {
            const grade = grades[subject] || { previous: 0, current: 0 };
            const container = document.createElement('div');
            container.className = 'progress-container';
            container.innerHTML = `
                <div class="progress-details">
                    <div class="progress-label">${escapeHtml(subject)}</div>
                    <span>${grade.current}/100 คะแนน</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-bar-fill" style="width: ${grade.current}%;"></div>
                </div>
            `;
            list.appendChild(container);
        });
    } else if (role === 'subject_teacher') {
        // Teacher grading UI: list students of class and allow editing grades for the teacher's subject(s)
        const teachSubjects = state.currentUser.subjects || [];
        if (teachSubjects.length === 0) {
            list.innerHTML = '<div class="empty-state">คุณไม่มีวิชาที่ได้รับมอบหมายให้สอน</div>';
            return;
        }

        const classSel = document.getElementById('homeClassroomSelector').value;
        const classroom = state.classRooms.find(c => c.id === classSel);
        if (!classroom || !classroom.studentIds || classroom.studentIds.length === 0) {
            list.innerHTML = '<div class="empty-state">ไม่พบนักเรียนในห้องเรียนนี้</div>';
            return;
        }

        const container = document.createElement('div');
        container.style.marginTop = '10px';
        
        teachSubjects.forEach(subject => {
            const header = document.createElement('h4');
            header.textContent = `วิชา ${subject}`;
            header.style.marginBottom = '10px';
            container.appendChild(header);

            classroom.studentIds.forEach(studId => {
                const stud = state.users.find(u => u.id === studId);
                if (!stud) return;

                const grades = state.studentGrades[studId] || {};
                const grade = grades[subject] || { previous: 0, current: 0 };

                const row = document.createElement('div');
                row.className = 'progress-container';
                row.style.marginBottom = '15px';
                row.style.display = 'flex';
                row.style.flexDirection = 'column';
                row.innerHTML = `
                    <div style="display:flex; justify-content:space-between; margin-bottom: 5px;">
                        <strong>${escapeHtml(stud.name)}</strong>
                    </div>
                    <div style="display:flex; gap:10px; align-items:center;">
                        <span style="font-size:12px; width:70px;">ภาคเรียนที่ 1:</span>
                        <input type="number" class="form-control" style="width:70px; padding: 4px 8px;" value="${grade.previous}" min="0" max="100" data-student="${studId}" data-subject="${subject}" data-type="previous">
                        <span style="font-size:12px; width:70px; margin-left: 10px;">ภาคเรียนที่ 2:</span>
                        <input type="number" class="form-control" style="width:70px; padding: 4px 8px;" value="${grade.current}" min="0" max="100" data-student="${studId}" data-subject="${subject}" data-type="current">
                    </div>
                `;

                row.querySelectorAll('input').forEach(input => {
                    input.addEventListener('change', (e) => {
                        const val = parseInt(e.target.value) || 0;
                        const sId = e.target.dataset.student;
                        const subj = e.target.dataset.subject;
                        const type = e.target.dataset.type;

                        state.studentGrades[sId] = state.studentGrades[sId] || {};
                        state.studentGrades[sId][subj] = state.studentGrades[sId][subj] || { previous: 0, current: 0 };
                        state.studentGrades[sId][subj][type] = Math.min(100, Math.max(0, val));
                        
                        saveData();
                    });
                });

                container.appendChild(row);
            });
        });

        list.appendChild(container);
    } else if (role === 'admin') {
        // Admin grading UI: list students of class and allow editing grades for ALL subjects
        const classSel = document.getElementById('homeClassroomSelector').value;
        const classroom = state.classRooms.find(c => c.id === classSel);
        if (!classroom || !classroom.studentIds || classroom.studentIds.length === 0) {
            list.innerHTML = '<div class="empty-state">ไม่พบนักเรียนในห้องเรียนนี้</div>';
            return;
        }

        const container = document.createElement('div');
        container.style.marginTop = '10px';
        
        state.subjects.forEach(subject => {
            const header = document.createElement('h4');
            header.textContent = `วิชา ${subject}`;
            header.style.margin = '15px 0 10px 0';
            header.style.color = 'var(--accent)';
            container.appendChild(header);

            classroom.studentIds.forEach(studId => {
                const stud = state.users.find(u => u.id === studId);
                if (!stud) return;

                const grades = state.studentGrades[studId] || {};
                const grade = grades[subject] || { previous: 0, current: 0 };

                const row = document.createElement('div');
                row.className = 'progress-container';
                row.style.marginBottom = '10px';
                row.style.display = 'flex';
                row.style.flexDirection = 'column';
                row.innerHTML = `
                    <div style="display:flex; justify-content:space-between; margin-bottom: 5px;">
                        <strong>${escapeHtml(stud.name)}</strong>
                    </div>
                    <div style="display:flex; gap:10px; align-items:center;">
                        <span style="font-size:12px; width:70px;">ภาคเรียนที่ 1:</span>
                        <input type="number" class="form-control" style="width:70px; padding: 4px 8px;" value="${grade.previous}" min="0" max="100" data-student="${studId}" data-subject="${subject}" data-type="previous">
                        <span style="font-size:12px; width:70px; margin-left: 10px;">ภาคเรียนที่ 2:</span>
                        <input type="number" class="form-control" style="width:70px; padding: 4px 8px;" value="${grade.current}" min="0" max="100" data-student="${studId}" data-subject="${subject}" data-type="current">
                    </div>
                `;

                row.querySelectorAll('input').forEach(input => {
                    input.addEventListener('change', (e) => {
                        const val = parseInt(e.target.value) || 0;
                        const sId = e.target.dataset.student;
                        const subj = e.target.dataset.subject;
                        const type = e.target.dataset.type;

                        state.studentGrades[sId] = state.studentGrades[sId] || {};
                        state.studentGrades[sId][subj] = state.studentGrades[sId][subj] || { previous: 0, current: 0 };
                        state.studentGrades[sId][subj][type] = Math.min(100, Math.max(0, val));
                        
                        saveData();
                    });
                });

                container.appendChild(row);
            });
        });

        list.appendChild(container);
    } else {
        // Homeroom, Academic Affairs, Discipline Affairs: view-only summary table of all student grades
        const classSel = document.getElementById('homeClassroomSelector').value;
        const classroom = state.classRooms.find(c => c.id === classSel);
        if (!classroom || !classroom.studentIds || classroom.studentIds.length === 0) {
            list.innerHTML = '<div class="empty-state">ไม่พบนักเรียนในห้องเรียนนี้</div>';
            return;
        }

        const tableContainer = document.createElement('div');
        tableContainer.className = 'table-container';
        tableContainer.style.marginTop = '10px';
        
        let html = `
            <table class="crm-table" style="font-size: 13px;">
                <thead>
                    <tr>
                        <th>ชื่อนักเรียน</th>
                        ${state.subjects.map(s => `<th>${escapeHtml(s)}</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
        `;

        classroom.studentIds.forEach(studId => {
            const stud = state.users.find(u => u.id === studId);
            if (!stud) return;
            const grades = state.studentGrades[studId] || {};
            html += `
                <tr>
                    <td><strong>${escapeHtml(stud.name)}</strong></td>
                    ${state.subjects.map(s => {
                        const g = grades[s] || { previous: 0, current: 0 };
                        return `<td>${g.current}/100</td>`;
                    }).join('')}
                </tr>
            `;
        });

        html += `
                </tbody>
            </table>
        `;
        tableContainer.innerHTML = html;
        list.appendChild(tableContainer);
    }
}

/* ============================================================
   Charts
   ============================================================ */
let timeChart = null;
let resultChart = null;

function renderCharts() {
    renderTimeChart();
    renderResultChart();
}

function renderTimeChart() {
    const chartDiv = document.querySelector('#chart_time_study');
    if (!chartDiv) return;

    const role = state.currentUser ? state.currentUser.role : 'student';
    let total = 0;
    let done = 0;

    if (role === 'student') {
        const studentClass = state.currentUser ? state.currentUser.classRoomId : 'c_p6_1';
        const studentId = state.currentUser ? state.currentUser.id : '';
        let studentHw = state.homework.filter(hw => hw.classRoomId === studentClass);
        if (activeTimeframeFilter === 'today') {
            studentHw = studentHw.filter(hw => hw.due === 'today');
        } else if (activeTimeframeFilter === 'week') {
            studentHw = studentHw.filter(hw => hw.due === 'today' || hw.due === 'tomorrow');
        }
        total = studentHw.length;
        done = studentHw.filter(hw => hw.completedBy && hw.completedBy.includes(studentId)).length;
    } else {
        const classSelElement = document.getElementById('homeClassroomSelector');
        const classSel = classSelElement ? classSelElement.value : 'c_p6_1';
        let classHw = state.homework.filter(hw => hw.classRoomId === classSel);
        if (activeTimeframeFilter === 'today') {
            classHw = classHw.filter(hw => hw.due === 'today');
        } else if (activeTimeframeFilter === 'week') {
            classHw = classHw.filter(hw => hw.due === 'today' || hw.due === 'tomorrow');
        }
        total = classHw.length;

        const classroom = state.classRooms.find(c => c.id === classSel);
        if (classroom && classroom.studentIds && classroom.studentIds.length > 0 && total > 0) {
            let totalPossible = total * classroom.studentIds.length;
            let actual = 0;
            classHw.forEach(hw => {
                if (hw.completedBy) {
                    actual += hw.completedBy.filter(id => classroom.studentIds.includes(id)).length;
                }
            });
            done = actual;
            total = totalPossible;
        } else {
            total = 0;
            done = 0;
        }
    }

    const percent = total === 0 ? 0 : Math.round((done / total) * 100);

    const options = {
        series: [percent],
        chart: {
            height: 250,
            type: 'radialBar',
            offsetY: -10,
            fontFamily: 'Prompt, sans-serif'
        },
        plotOptions: {
            radialBar: {
                startAngle: -135,
                endAngle: 135,
                dataLabels: {
                    name: {
                        fontSize: '12px',
                        color: 'var(--dark-light)',
                        offsetY: 70
                    },
                    value: {
                        offsetY: 30,
                        fontSize: '22px',
                        color: 'var(--dark)',
                        formatter: function (val) {
                            return val + '%';
                        }
                    }
                }
            }
        },
        fill: {
            type: 'solid',
            colors: ['#000000']
        },
        stroke: {
            dashArray: 4
        },
        labels: ['การบ้านเสร็จแล้ว'],
        colors: ['#000000']
    };

    if (timeChart) {
        timeChart.updateOptions(options);
    } else {
        timeChart = new ApexCharts(chartDiv, options);
        timeChart.render();
    }
}

function renderResultChart() {
    const chartDiv = document.querySelector('#chart_result_study');
    if (!chartDiv) return;

    const role = state.currentUser ? state.currentUser.role : 'student';
    const subjects = state.subjects;
    let previous = [];
    let current = [];

    if (role === 'student') {
        const studentId = state.currentUser ? state.currentUser.id : '';
        const grades = state.studentGrades[studentId] || {};
        previous = subjects.map(s => (grades[s] || {}).previous || 0);
        current = subjects.map(s => (grades[s] || {}).current || 0);
    } else {
        const classSelElement = document.getElementById('homeClassroomSelector');
        const classSel = classSelElement ? classSelElement.value : 'c_p6_1';
        const classroom = state.classRooms.find(c => c.id === classSel);
        if (classroom && classroom.studentIds && classroom.studentIds.length > 0) {
            previous = subjects.map(s => {
                let sum = 0, count = 0;
                classroom.studentIds.forEach(id => {
                    const grades = state.studentGrades[id] || {};
                    if (grades[s]) {
                        sum += grades[s].previous || 0;
                        count++;
                    }
                });
                return count > 0 ? Math.round(sum / count) : 0;
            });
            current = subjects.map(s => {
                let sum = 0, count = 0;
                classroom.studentIds.forEach(id => {
                    const grades = state.studentGrades[id] || {};
                    if (grades[s]) {
                        sum += grades[s].current || 0;
                        count++;
                    }
                });
                return count > 0 ? Math.round(sum / count) : 0;
            });
        } else {
            previous = subjects.map(s => 0);
            current = subjects.map(s => 0);
        }
    }

    const options = {
        series: [
            { name: 'ภาคเรียนที่ 1', data: previous },
            { name: 'ภาคเรียนที่ 2', data: current }
        ],
        chart: {
            height: 250,
            type: 'area',
            fontFamily: 'Prompt, sans-serif',
            offsetY: 10,
            toolbar: { show: false }
        },
        colors: ['#000000', '#000000'],
        dataLabels: { enabled: false },
        stroke: { curve: 'smooth', width: 2 },
        xaxis: {
            type: 'category',
            categories: subjects,
            labels: { style: { colors: 'var(--dark-light)', fontFamily: 'Prompt, sans-serif' } }
        },
        yaxis: {
            labels: { style: { colors: 'var(--dark-light)', fontFamily: 'Prompt, sans-serif' } }
        },
        tooltip: { theme: 'dark' },
        legend: { labels: { colors: 'var(--dark-light)', fontFamily: 'Prompt, sans-serif' } }
    };

    if (resultChart) {
        resultChart.updateOptions(options);
    } else {
        resultChart = new ApexCharts(chartDiv, options);
        resultChart.render();
    }
}

/* ============================================================
   Homework modal (add / edit / delete)
   ============================================================ */
function wireModals() {
    const hwOverlay = document.getElementById('homeworkModalOverlay');
    const hwForm = document.getElementById('homeworkForm');
    const hwSubjectSelect = document.getElementById('homeworkSubject');

    const addHwBtn = document.getElementById('addHomeworkBtn');
    if (addHwBtn) addHwBtn.addEventListener('click', () => openHomeworkModal(null));
    
    const hwCloseBtn = document.getElementById('homeworkModalClose');
    if (hwCloseBtn) hwCloseBtn.addEventListener('click', closeHomeworkModal);

    const hwCancelBtn = document.getElementById('homeworkCancelBtn');
    if (hwCancelBtn) hwCancelBtn.addEventListener('click', closeHomeworkModal);

    if (hwOverlay) {
        hwOverlay.addEventListener('click', (e) => { if (e.target === hwOverlay) closeHomeworkModal(); });
    }

    if (hwForm) {
        hwForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const id = document.getElementById('homeworkId').value;
            const subject = hwSubjectSelect.value;
            const title = document.getElementById('homeworkTitle').value.trim();
            const detail = document.getElementById('homeworkDetail').value.trim();
            const due = document.getElementById('homeworkDue').value;

            if (!title) return;

            if (id) {
                const hw = state.homework.find(h => h.id === id);
                if (hw) {
                    hw.subject = subject;
                    hw.title = title;
                    hw.detail = detail;
                    hw.due = due;
                }
            } else {
                const role = state.currentUser ? state.currentUser.role : 'student';
                let classRoomId = 'c_p6_1';
                if (role === 'student') {
                    classRoomId = state.currentUser.classRoomId || 'c_p6_1';
                } else {
                    const classSel = document.getElementById('homeClassroomSelector');
                    if (classSel) {
                        classRoomId = classSel.value;
                    }
                }
                state.homework.push({
                    id: uid(),
                    subject,
                    title,
                    detail,
                    due,
                    done: false,
                    classRoomId,
                    createdBy: state.currentUser ? state.currentUser.id : null,
                    completedBy: []
                });
            }

            saveData();
            closeHomeworkModal();
            renderHomework();
        });
    }

    const hwDeleteBtn = document.getElementById('homeworkDeleteBtn');
    if (hwDeleteBtn) {
        hwDeleteBtn.addEventListener('click', () => {
            const id = document.getElementById('homeworkId').value;
            if (!id) return;
            if (!confirm('ลบการบ้านนี้ใช่หรือไม่?')) return;
            state.homework = state.homework.filter(h => h.id !== id);
            saveData();
            closeHomeworkModal();
            renderHomework();
        });
    }

    /* Grades modal */
    const gradesOverlay = document.getElementById('gradesModalOverlay');
    const editGradesBtn = document.getElementById('editGradesBtn');
    if (editGradesBtn) editGradesBtn.addEventListener('click', openGradesModal);
    
    const gradesCloseBtn = document.getElementById('gradesModalClose');
    if (gradesCloseBtn) gradesCloseBtn.addEventListener('click', closeGradesModal);

    const gradesCancelBtn = document.getElementById('gradesCancelBtn');
    if (gradesCancelBtn) gradesCancelBtn.addEventListener('click', closeGradesModal);

    if (gradesOverlay) {
        gradesOverlay.addEventListener('click', (e) => { if (e.target === gradesOverlay) closeGradesModal(); });
    }

    const addSubjectBtn = document.getElementById('addSubjectBtn');
    if (addSubjectBtn) {
        addSubjectBtn.addEventListener('click', () => {
            const input = document.getElementById('newSubjectName');
            const name = input.value.trim();
            if (!name) return;
            if (state.subjects.includes(name)) { input.value = ''; return; }
            state.subjects.push(name);
            state.grades[name] = { previous: 0, current: 0 };
            input.value = '';
            renderGradesFormFields();
        });
    }

    const gradesForm = document.getElementById('gradesForm');
    if (gradesForm) {
        gradesForm.addEventListener('submit', (e) => {
            e.preventDefault();
            state.subjects.forEach(subject => {
                const prevInput = document.querySelector(`[data-prev-for="${cssEscape(subject)}"]`);
                const curInput = document.querySelector(`[data-cur-for="${cssEscape(subject)}"]`);
                if (prevInput && curInput) {
                    state.grades[subject] = {
                        previous: clampScore(prevInput.value),
                        current: clampScore(curInput.value)
                    };
                }
            });
            saveData();
            populateSubjectFilter();
            renderGrades();
            renderHomework();
            closeGradesModal();
        });
    }
}

function clampScore(val) {
    let n = parseInt(val, 10);
    if (isNaN(n)) n = 0;
    return Math.max(0, Math.min(100, n));
}

function cssEscape(str) {
    return String(str).replace(/["\\]/g, '\\$&');
}

function openHomeworkModal(id, canEdit = true) {
    const overlay = document.getElementById('homeworkModalOverlay');
    const subjectSelect = document.getElementById('homeworkSubject');
    subjectSelect.innerHTML = '';

    const role = state.currentUser ? state.currentUser.role : 'student';

    // Subject teachers can only assign/edit homework in their taught subjects
    let allowedSubjects = state.subjects;
    if (role === 'subject_teacher') {
        allowedSubjects = state.currentUser.subjects || [];
    }

    allowedSubjects.forEach(subject => {
        const opt = document.createElement('option');
        opt.value = subject;
        opt.textContent = subject;
        subjectSelect.appendChild(opt);
    });

    const deleteBtn = document.getElementById('homeworkDeleteBtn');
    const saveBtn = overlay.querySelector('.modal-btn-save');
    const titleInput = document.getElementById('homeworkTitle');
    const detailInput = document.getElementById('homeworkDetail');
    const dueSelect = document.getElementById('homeworkDue');

    // Disable/enable inputs based on canEdit
    subjectSelect.disabled = !canEdit;
    titleInput.disabled = !canEdit;
    detailInput.disabled = !canEdit;
    dueSelect.disabled = !canEdit;

    if (saveBtn) {
        saveBtn.style.display = canEdit ? 'block' : 'none';
    }

    if (id) {
        const hw = state.homework.find(h => h.id === id);
        if (!hw) return;
        document.getElementById('homeworkModalTitle').textContent = canEdit ? 'แก้ไขการบ้าน' : 'รายละเอียดการบ้าน';
        document.getElementById('homeworkId').value = hw.id;
        subjectSelect.value = hw.subject;
        titleInput.value = hw.title;
        detailInput.value = hw.detail || '';
        dueSelect.value = hw.due;
        deleteBtn.hidden = !canEdit;
    } else {
        document.getElementById('homeworkModalTitle').textContent = 'เพิ่มการบ้าน';
        document.getElementById('homeworkId').value = '';
        titleInput.value = '';
        detailInput.value = '';
        dueSelect.value = activeDueTab;
        if (allowedSubjects.length) {
            subjectSelect.value = allowedSubjects[0];
        }
        deleteBtn.hidden = true;
    }

    overlay.classList.add('show');
}

function closeHomeworkModal() {
    document.getElementById('homeworkModalOverlay').classList.remove('show');
}

function openGradesModal() {
    renderGradesFormFields();
    document.getElementById('gradesModalOverlay').classList.add('show');
}

function closeGradesModal() {
    document.getElementById('gradesModalOverlay').classList.remove('show');
}

function renderGradesFormFields() {
    const wrap = document.getElementById('gradesFormFields');
    wrap.innerHTML = '';
    state.subjects.forEach(subject => {
        const grade = state.grades[subject] || { previous: 0, current: 0 };
        const row = document.createElement('div');
        row.className = 'grade-row';
        row.innerHTML = `
      <div class="grade-row-top">
        <span class="grade-subject-name">${escapeHtml(subject)}</span>
        <button type="button" class="grade-remove-btn" data-remove="${escapeHtml(subject)}"><i class="bi bi-trash"></i></button>
      </div>
      <div class="grade-row-inputs">
        <div class="grade-input-group">
          <label>ภาคเรียนที่ 1</label>
          <input type="number" min="0" max="100" value="${grade.previous}" data-prev-for="${escapeHtml(subject)}">
        </div>
        <div class="grade-input-group">
          <label>ภาคเรียนที่ 2</label>
          <input type="number" min="0" max="100" value="${grade.current}" data-cur-for="${escapeHtml(subject)}">
        </div>
      </div>
    `;
        wrap.appendChild(row);
    });

    wrap.querySelectorAll('[data-remove]').forEach(btn => {
        btn.addEventListener('click', () => {
            const subject = btn.getAttribute('data-remove');
            state.subjects = state.subjects.filter(s => s !== subject);
            delete state.grades[subject];
            renderGradesFormFields();
        });
    });
}

/* ============================================================
   Clock
   ============================================================ */
const updateTime = () => {
    const now = new Date();

    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    };
    const formattedDateTime = now.toLocaleDateString('th-TH', options);
    const nowTodayElem = document.getElementById('now_today');
    if (nowTodayElem) {
        nowTodayElem.innerHTML = formattedDateTime;
    }
};
setInterval(updateTime, 1000);

/* ============================================================
   2. ARCHIVE VIEW LOGIC
   ============================================================ */
let archiveSearchQuery = '';

function initArchiveView() {
    const searchInput = document.getElementById('archiveSearchInput');
    const clearBtn = document.getElementById('clearAllArchiveBtn');

    // Remove existing listener to prevent stacking
    const newSearchInput = searchInput.cloneNode(true);
    searchInput.parentNode.replaceChild(newSearchInput, searchInput);

    newSearchInput.addEventListener('input', () => {
        archiveSearchQuery = newSearchInput.value.trim().toLowerCase();
        renderArchiveList();
    });

    clearBtn.onclick = () => {
        if (state.homework.filter(h => h.done).length === 0) return;
        if (!confirm('ล้างข้อมูลการบ้านที่ทำเสร็จแล้วออกจากคลังถาวรทั้งหมดใช่หรือไม่?')) return;
        state.homework = state.homework.filter(h => !h.done);
        saveData();
        renderArchiveList();
    };

    renderArchiveList();
}

function renderArchiveList() {
    const container = document.getElementById('archiveHomeworkList');
    container.innerHTML = '';

    let completedHw = state.homework.filter(h => h.done);

    if (archiveSearchQuery) {
        completedHw = completedHw.filter(h =>
            h.title.toLowerCase().includes(archiveSearchQuery) ||
            h.detail.toLowerCase().includes(archiveSearchQuery) ||
            h.subject.toLowerCase().includes(archiveSearchQuery)
        );
    }

    if (completedHw.length === 0) {
        container.innerHTML = '<div class="empty-state">ไม่มีรายการการบ้านที่เสร็จแล้วในคลังนี้</div>';
        return;
    }

    completedHw.forEach(hw => {
        const item = document.createElement('div');
        item.className = 'archive-item';
        item.innerHTML = `
            <div class="archive-item-info">
                <span class="archive-item-title">${escapeHtml(hw.title)}</span>
                <div class="archive-item-meta">
                    <span><i class="bi bi-tag"></i> ${escapeHtml(hw.subject)}</span>
                    <span><i class="bi bi-clock"></i> ส่งแบบ: ${hw.due === 'today' ? 'วันนี้' : 'พรุ่งนี้'}</span>
                </div>
            </div>
            <div class="archive-item-actions">
                <button class="btn-archive-restore" title="ดึงกลับไปทำงานใหม่" data-restore="${hw.id}"><i class="bi bi-arrow-counterclockwise"></i></button>
                <button class="btn-archive-delete" title="ลบถาวร" data-delete="${hw.id}"><i class="bi bi-trash"></i></button>
            </div>
        `;

        item.querySelector('[data-restore]').onclick = () => {
            hw.done = false;
            state.points = Math.max(0, state.points - 50);
            saveData();
            renderArchiveList();
        };

        item.querySelector('[data-delete]').onclick = () => {
            if (!confirm('ต้องการลบการบ้านนี้ถาวรใช่หรือไม่?')) return;
            state.homework = state.homework.filter(h => h.id !== hw.id);
            saveData();
            renderArchiveList();
        };

        container.appendChild(item);
    });
}

/* ============================================================
   3. SHOP VIEW LOGIC
   ============================================================ */
function initShopView() {
    renderShop();
}

function renderShop() {
    // Render point balance
    document.getElementById('shopPointsBalance').textContent = state.points;

    // Render Inventory
    const invList = document.getElementById('inventoryList');
    invList.innerHTML = '';

    let invCount = 0;
    Object.keys(state.purchasedItems).forEach(itemId => {
        const qty = state.purchasedItems[itemId];
        if (qty > 0) {
            const itemDef = shopItems.find(i => i.id === itemId);
            if (itemDef) {
                invCount += qty;
                const div = document.createElement('div');
                div.className = 'inventory-item';
                div.innerHTML = `
                    <span>${itemDef.icon} ${escapeHtml(itemDef.name)}</span>
                    <span class="inventory-item-qty">x${qty}</span>
                `;
                invList.appendChild(div);
            }
        }
    });
    document.getElementById('inventoryCount').textContent = invCount;

    if (invCount === 0) {
        invList.innerHTML = '<div style="font-size: 11px; text-align:center; color: var(--dark-light); padding: 10px;">ยังไม่มีของสะสม</div>';
    }

    // Render Shop Grid
    const grid = document.getElementById('shopGrid');
    grid.innerHTML = '';

    shopItems.forEach(item => {
        const card = document.createElement('div');
        card.className = 'shop-item-card animate__animated animate__fadeInUp';
        const canBuy = state.points >= item.price;

        card.innerHTML = `
            <div class="shop-item-icon">${item.icon}</div>
            <div class="shop-item-title">${escapeHtml(item.name)}</div>
            <div class="shop-item-desc">${escapeHtml(item.desc)}</div>
            <div class="shop-item-price">${item.price} Pts</div>
            <button class="btn-buy" ${canBuy ? '' : 'disabled'}>แลกรับรางวัล</button>
        `;

        card.querySelector('.btn-buy').onclick = () => {
            if (state.points >= item.price) {
                state.points -= item.price;
                state.purchasedItems[item.id] = (state.purchasedItems[item.id] || 0) + 1;
                saveData();
                renderShop();
                alert(`สำเร็จ! คุณแลกรับ "${item.name}" เรียบร้อยแล้ว`);
            }
        };

        grid.appendChild(card);
    });
}

/* ============================================================
   4. CALENDAR VIEW LOGIC
   ============================================================ */
function initCalendarView() {
    document.getElementById('prevMonthBtn').onclick = () => {
        calendarDate.setMonth(calendarDate.getMonth() - 1);
        renderCalendar();
    };
    document.getElementById('nextMonthBtn').onclick = () => {
        calendarDate.setMonth(calendarDate.getMonth() + 1);
        renderCalendar();
    };
    document.getElementById('todayMonthBtn').onclick = () => {
        calendarDate = new Date();
        renderCalendar();
    };

    renderCalendar();
}

function renderCalendar() {
    const monthNames = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];
    const container = document.getElementById('calendarDaysContainer');
    container.innerHTML = '';

    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();

    document.getElementById('calendarMonthYearLabel').textContent = `${monthNames[month]} ${year + 543}`;

    // Get first day of month
    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    // Previous month total days
    const prevMonthDays = new Date(year, month, 0).getDate();

    // Render empty slots from previous month
    for (let i = firstDay - 1; i >= 0; i--) {
        const dayCell = document.createElement('div');
        dayCell.className = 'calendar-day-cell other-month animate__animated animate__fadeIn';
        dayCell.innerHTML = `<span class="calendar-day-number">${prevMonthDays - i}</span>`;
        container.appendChild(dayCell);
    }

    // Current month days
    const today = new Date();
    for (let day = 1; day <= totalDays; day++) {
        const dayCell = document.createElement('div');
        const isToday = today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
        dayCell.className = 'calendar-day-cell animate__animated animate__fadeIn' + (isToday ? ' today' : '');

        // Match homework for this specific date
        // Since mockup targets "today" and "tomorrow", let's bind homework to calendar today/tomorrow cells dynamically
        let dayEventsHtml = '';
        const cellDate = new Date(year, month, day);

        state.homework.forEach(hw => {
            let hwMatchesDate = false;

            if (hw.due === 'today') {
                hwMatchesDate = cellDate.toDateString() === today.toDateString();
            } else if (hw.due === 'tomorrow') {
                const tomorrow = new Date(today);
                tomorrow.setDate(today.getDate() + 1);
                hwMatchesDate = cellDate.toDateString() === tomorrow.toDateString();
            }

            if (hwMatchesDate) {
                const color = hw.done ? '#2ecc71' : '#e74c3c';
                dayEventsHtml += `<span class="calendar-event-tag" style="background-color: ${color};" title="${escapeHtml(hw.title)}">${escapeHtml(hw.title)}</span>`;
            }
        });

        dayCell.innerHTML = `
            <span class="calendar-day-number">${day}</span>
            <div class="calendar-day-events">${dayEventsHtml}</div>
        `;
        container.appendChild(dayCell);
    }

    // Fill remaining slots
    const totalRendered = firstDay + totalDays;
    const remaining = 42 - totalRendered;
    for (let i = 1; i <= remaining; i++) {
        const dayCell = document.createElement('div');
        dayCell.className = 'calendar-day-cell other-month';
        dayCell.innerHTML = `<span class="calendar-day-number">${i}</span>`;
        container.appendChild(dayCell);
    }
}

/* ============================================================
   5. GRADES & GPA CALCULATOR LOGIC
   ============================================================ */
function initGradesView() {
    renderGpaOverview();
    renderGpaCalculator();
}

function calculateGradePoint(score) {
    if (score >= 80) return 4.0;
    if (score >= 75) return 3.5;
    if (score >= 70) return 3.0;
    if (score >= 65) return 2.5;
    if (score >= 60) return 2.0;
    if (score >= 55) return 1.5;
    if (score >= 50) return 1.0;
    return 0.0;
}

function renderGpaOverview() {
    let totalPoints = 0;
    let subjectCount = state.subjects.length;

    state.subjects.forEach(sub => {
        const score = state.grades[sub] ? state.grades[sub].current : 0;
        totalPoints += calculateGradePoint(score);
    });

    const gpa = subjectCount > 0 ? (totalPoints / subjectCount).toFixed(2) : '0.00';
    document.getElementById('dashboardGpa').textContent = gpa;
    document.getElementById('totalSubjectsCount').textContent = `${subjectCount} วิชา`;

    const rangeLabel = document.querySelector('.grade-stats .badge-grade');
    const floatGpa = parseFloat(gpa);
    if (floatGpa >= 3.5) {
        rangeLabel.textContent = 'ดีเยี่ยม';
        rangeLabel.className = 'badge-grade grade-good';
    } else if (floatGpa >= 2.5) {
        rangeLabel.textContent = 'ดีมาก';
        rangeLabel.className = 'badge-grade grade-good';
    } else if (floatGpa >= 1.5) {
        rangeLabel.textContent = 'ผ่านเกณฑ์';
        rangeLabel.className = 'badge-grade';
    } else {
        rangeLabel.textContent = 'ปรับปรุง';
        rangeLabel.className = 'badge-grade';
        rangeLabel.style.backgroundColor = 'rgba(231,76,60,0.15)';
        rangeLabel.style.color = '#e74c3c';
    }
}

function renderGpaCalculator() {
    const list = document.getElementById('calcSubjectsList');
    list.innerHTML = '';

    state.subjects.forEach(subject => {
        const currentGrade = state.grades[subject] ? state.grades[subject].current : 0;
        const row = document.createElement('div');
        row.className = 'calc-subject-row';
        row.innerHTML = `
            <span class="calc-subject-name">${escapeHtml(subject)}</span>
            <input type="number" min="0" max="100" class="form-control" value="${currentGrade}" data-calc-score-for="${escapeHtml(subject)}">
            <span class="calc-points-label" data-calc-points-for="${escapeHtml(subject)}" style="font-weight: 700; text-align: right;">4.0</span>
        `;

        row.querySelector('input').addEventListener('input', () => {
            recalculateSimulatedGpa();
        });

        list.appendChild(row);
    });

    recalculateSimulatedGpa();
}

function recalculateSimulatedGpa() {
    let totalPoints = 0;
    let subjectCount = state.subjects.length;

    state.subjects.forEach(sub => {
        const input = document.querySelector(`[data-calc-score-for="${cssEscape(sub)}"]`);
        const score = input ? clampScore(input.value) : 0;
        const pt = calculateGradePoint(score);

        const ptLabel = document.querySelector(`[data-calc-points-for="${cssEscape(sub)}"]`);
        if (ptLabel) ptLabel.textContent = pt.toFixed(1);

        totalPoints += pt;
    });

    const gpa = subjectCount > 0 ? (totalPoints / subjectCount).toFixed(2) : '0.00';
    document.getElementById('simulatedGpa').textContent = gpa;
}

/* ============================================================
   6. PEOPLE VIEW LOGIC
   ============================================================ */
let activePeopleTab = 'teachers';

function initPeopleView() {
    const tabs = document.querySelectorAll('.people-tab');
    tabs.forEach(tab => {
        tab.onclick = () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            activePeopleTab = tab.getAttribute('data-tab');
            renderPeople();
        };
    });

    renderPeople();
}

function renderPeople() {
    const container = document.getElementById('peopleContent');
    container.innerHTML = '';

    const grid = document.createElement('div');
    grid.className = 'people-grid';

    if (activePeopleTab === 'teachers') {
        teachers.forEach(teacher => {
            const card = document.createElement('div');
            card.className = 'people-card';
            card.innerHTML = `
                <img src="${teacher.img}">
                <div class="people-card-info">
                    <h4>${escapeHtml(teacher.name)}</h4>
                    <small><i class="bi bi-mortarboard"></i> วิชา: ${escapeHtml(teacher.subject)}</small>
                    <small><i class="bi bi-shield-check"></i> ${escapeHtml(teacher.role)}</small>
                </div>
            `;
            grid.appendChild(card);
        });
    } else {
        classmates.forEach(mate => {
            const card = document.createElement('div');
            card.className = 'people-card';

            let roleClass = 'role-member';
            if (mate.role === 'หัวหน้าห้อง') roleClass = 'role-head';
            else if (mate.role === 'รองหัวหน้าห้อง') roleClass = 'role-vice';

            card.innerHTML = `
                <img src="${mate.img}">
                <div class="people-card-info">
                    <h4>${escapeHtml(mate.name)}</h4>
                    <span class="people-role-badge ${roleClass}">${escapeHtml(mate.role)}</span>
                </div>
            `;
            grid.appendChild(card);
        });
    }

    container.appendChild(grid);
}

/* ============================================================
   8. PORTFOLIO VIEW LOGIC
   ============================================================ */
function initPortfolioView() {
    const overlay = document.getElementById('portfolioModalOverlay');
    const closeBtn = document.getElementById('portfolioModalClose');
    const cancelBtn = document.getElementById('portfolioCancelBtn');
    const form = document.getElementById('portfolioForm');

    document.getElementById('addPortfolioBtn').onclick = () => {
        form.reset();
        overlay.classList.add('show');
    };

    closeBtn.onclick = () => overlay.classList.remove('show');
    cancelBtn.onclick = () => overlay.classList.remove('show');
    overlay.onclick = (e) => { if (e.target === overlay) overlay.classList.remove('show'); };

    form.onsubmit = (e) => {
        e.preventDefault();
        const title = document.getElementById('portfolioTitle').value.trim();
        const category = document.getElementById('portfolioCategory').value.trim();
        const detail = document.getElementById('portfolioDetail').value.trim();
        const img = document.getElementById('portfolioImage').value.trim() || 'https://cdn.jsdelivr.net/gh/JacketJK/image/logo-Project.png';

        if (!title || !category) return;

        state.portfolio.push({
            id: uid(),
            title,
            category,
            detail,
            img
        });

        saveData();
        overlay.classList.remove('show');
        renderPortfolio();
    };

    renderPortfolio();
}

function renderPortfolio() {
    const grid = document.getElementById('portfolioGrid');
    grid.innerHTML = '';

    if (state.portfolio.length === 0) {
        grid.innerHTML = '<div class="empty-state" style="grid-column: 1/-1;">ไม่มีผลงานสะสมสะสมในพอร์ตโฟลิโอของคุณ</div>';
        return;
    }

    state.portfolio.forEach(item => {
        const card = document.createElement('div');
        card.className = 'portfolio-card animate__animated animate__fadeInUp';
        card.innerHTML = `
            <img src="${item.img}" class="portfolio-img" onerror="this.src='https://cdn.jsdelivr.net/gh/JacketJK/image/logo-Project.png'">
            <div class="portfolio-body">
                <span class="portfolio-badge">${escapeHtml(item.category)}</span>
                <div class="portfolio-card-title" style="margin-top: 8px;">${escapeHtml(item.title)}</div>
                <p class="portfolio-card-desc">${escapeHtml(item.detail || '')}</p>
                <button class="btn-archive-delete" style="padding: 0; background: transparent; border: 0;" data-delete-pf="${item.id}" title="ลบผลงาน"><i class="bi bi-trash text-accent"></i> ลบผลงาน</button>
            </div>
        `;

        card.querySelector('[data-delete-pf]').onclick = (e) => {
            e.stopPropagation();
            if (!confirm('ยืนยันลบชิ้นงานนี้จาก Portfolio หรือไม่?')) return;
            state.portfolio = state.portfolio.filter(p => p.id !== item.id);
            saveData();
            renderPortfolio();
        };

        grid.appendChild(card);
    });
}

/* ============================================================
   10. SETTINGS VIEW LOGIC
   ============================================================ */
function initSettingsView() {
    const form = document.getElementById('settingsProfileForm');
    const darkToggle = document.getElementById('settingsDarkModeToggle');

    // Load current settings values
    document.getElementById('settingsStudentName').value = state.studentName;
    document.getElementById('settingsStudentClass').value = state.studentClass;
    document.getElementById('settingsStudentPhoto').value = state.studentPhoto;
    darkToggle.checked = state.darkMode;

    // Handle Profile Form submit
    form.onsubmit = (e) => {
        e.preventDefault();
        state.studentName = document.getElementById('settingsStudentName').value.trim();
        state.studentClass = document.getElementById('settingsStudentClass').value.trim();
        state.studentPhoto = document.getElementById('settingsStudentPhoto').value.trim();

        saveData();
        applyThemeAndProfile();
        alert('บันทึกข้อมูลโปรไฟล์ของคุณเรียบร้อยแล้ว!');
    };

    // Handle Dark Mode toggle
    darkToggle.onchange = () => {
        state.darkMode = darkToggle.checked;
        saveData();
        applyThemeAndProfile();
    };

    // Accent colors group
    const colorDots = document.querySelectorAll('.color-dot');
    colorDots.forEach(dot => {
        const dotColor = dot.getAttribute('data-color');
        dot.classList.toggle('active', state.accentColor === dotColor);

        dot.onclick = () => {
            colorDots.forEach(d => d.classList.remove('active'));
            dot.classList.add('active');
            state.accentColor = dotColor;
            saveData();
            applyThemeAndProfile();
        };
    });
}

/* ============================================================
   11. ANNOUNCEMENTS & OFFCANVAS LOGIC
   ============================================================ */

function renderAnnouncements() {
    const container = document.getElementById('announcementsContainer');
    if (!container) return;
    container.innerHTML = '';

    let announcements = state.announcements;
    if (activeTimeframeFilter === 'today') {
        announcements = announcements.filter(ann => ann.id === 'ann2');
    } else if (activeTimeframeFilter === 'week') {
        announcements = announcements.filter(ann => ann.id === 'ann2' || ann.id === 'ann3');
    }

    announcements.forEach(ann => {
        const hasResponded = ann.type === 'acknowledge' ? ann.acknowledged : ann.voted;

        const box = document.createElement('div');
        box.className = `annouce-box animate__animated animate__fadeInRight ${hasResponded ? 'responded' : ''}`;
        box.dataset.id = ann.id;

        const actionText = ann.type === 'vote'
            ? (ann.voted ? 'ดูผลโหวต <i class="bi bi-bar-chart-fill"></i>' : 'โหวตเลย <i class="bi bi-chevron-right"></i>')
            : (ann.acknowledged ? 'รับทราบแล้ว <i class="bi bi-check2-all"></i>' : 'ตรวจสอบ <i class="bi bi-chevron-right"></i>');

        const badgeHtml = hasResponded
            ? `<span class="badge-responded"><i class="bi bi-check-circle-fill"></i> ${ann.type === 'vote' ? 'ลงคะแนนแล้ว' : 'รับทราบแล้ว'}</span>`
            : '';

        box.innerHTML = `
            <div class="annouce-detail">
                <img src="${ann.senderImg}" alt="${escapeHtml(ann.senderName)}">
                <div class="annouce-text">
                    <span>${escapeHtml(ann.title)}</span>
                    <span>${escapeHtml(ann.detail)}</span>
                    ${badgeHtml}
                    <button class="btn-check-ann" data-id="${ann.id}">${actionText}</button>
                </div>
            </div>
        `;

        // Clicking either the box or the button opens the offcanvas
        box.addEventListener('click', (e) => {
            openAnnouncementOffcanvas(ann.id);
        });

        // Prevent double trigger if button is clicked
        const btn = box.querySelector('.btn-check-ann');
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            openAnnouncementOffcanvas(ann.id);
        });

        container.appendChild(box);
    });
}

function wireAnnouncements() {
    const closeBtn = document.getElementById('announcementOffcanvasClose');
    const overlay = document.getElementById('announcementOffcanvasOverlay');

    if (closeBtn) {
        closeBtn.addEventListener('click', closeAnnouncementOffcanvas);
    }

    if (overlay) {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                closeAnnouncementOffcanvas();
            }
        });
    }

    // Wiring for Announcement Management Modal
    const manageBtn = document.getElementById('manageAnnouncementsBtn');
    const modalOverlay = document.getElementById('announcementModalOverlay');
    const modalClose = document.getElementById('announcementModalClose');
    const cancelBtn = document.getElementById('announcementCancelBtn');
    const deleteBtn = document.getElementById('announcementDeleteBtn');
    const form = document.getElementById('announcementForm');
    const typeSelect = document.getElementById('announcementType');
    const optionsGroup = document.getElementById('announcementVoteOptionsGroup');

    if (manageBtn) {
        manageBtn.onclick = () => {
            form.reset();
            document.getElementById('announcementId').value = '';
            document.getElementById('announcementModalTitle').textContent = 'สร้างประกาศใหม่';
            optionsGroup.style.display = 'none';
            deleteBtn.style.display = 'none';
            modalOverlay.classList.add('show');
        };
    }

    if (modalClose) modalClose.onclick = () => modalOverlay.classList.remove('show');
    if (cancelBtn) cancelBtn.onclick = () => modalOverlay.classList.remove('show');
    if (modalOverlay) {
        modalOverlay.onclick = (e) => {
            if (e.target === modalOverlay) modalOverlay.classList.remove('show');
        };
    }

    if (typeSelect) {
        typeSelect.onchange = () => {
            optionsGroup.style.display = (typeSelect.value === 'vote') ? 'block' : 'none';
        };
    }

    if (form) {
        form.onsubmit = (e) => {
            e.preventDefault();
            const id = document.getElementById('announcementId').value;
            const title = document.getElementById('announcementTitle').value.trim();
            const detail = document.getElementById('announcementDetail').value.trim();
            const type = typeSelect.value;
            
            let options = [];
            let votes = {};
            if (type === 'vote') {
                const optVal = document.getElementById('announcementVoteOptions').value.trim();
                options = optVal ? optVal.split(',').map(o => o.trim()).filter(o => o) : ['ตัวเลือก A', 'ตัวเลือก B'];
                options.forEach(o => {
                    votes[o] = 0;
                });
            }

            const senderName = state.currentUser ? state.currentUser.name : 'ระบบ';
            const senderImg = state.currentUser ? (state.currentUser.photo || 'https://cdn.jsdelivr.net/gh/JacketJK/image/logo-Project.png') : 'https://cdn.jsdelivr.net/gh/JacketJK/image/logo-Project.png';

            if (id) {
                const ann = state.announcements.find(a => a.id === id);
                if (ann) {
                    ann.title = title;
                    ann.detail = detail;
                    ann.type = type;
                    if (type === 'vote' && options.length) {
                        ann.options = options;
                        ann.votes = votes;
                        ann.voted = false;
                        ann.userVote = null;
                    }
                }
            } else {
                state.announcements.push({
                    id: uid(),
                    title,
                    detail,
                    senderName,
                    senderImg,
                    type,
                    options,
                    votes,
                    voted: false,
                    acknowledged: false,
                    userVote: null,
                    scope: 'school'
                });
            }

            saveData();
            modalOverlay.classList.remove('show');
            renderAnnouncements();
        };
    }

    if (deleteBtn) {
        deleteBtn.onclick = () => {
            const id = document.getElementById('announcementId').value;
            if (!id) return;
            if (!confirm('ยืนยันที่จะลบประกาศประชาสัมพันธ์นี้?')) return;
            state.announcements = state.announcements.filter(a => a.id !== id);
            saveData();
            modalOverlay.classList.remove('show');
            renderAnnouncements();
        };
    }
}

function openAnnouncementOffcanvas(id) {
    const ann = state.announcements.find(a => a.id === id);
    if (!ann) return;

    // Fill content
    document.getElementById('offcanvasTitle').textContent = ann.title;
    document.getElementById('offcanvasSenderImg').src = ann.senderImg;
    document.getElementById('offcanvasSenderName').textContent = ann.senderName;
    document.getElementById('offcanvasContent').textContent = ann.detail;

    const actionSection = document.getElementById('offcanvasActionSection');
    actionSection.innerHTML = '';

    if (ann.type === 'acknowledge') {
        const btn = document.createElement('button');
        btn.className = `offcanvas-btn-ack ${ann.acknowledged ? 'done' : ''}`;
        btn.disabled = ann.acknowledged;
        btn.innerHTML = ann.acknowledged
            ? '<i class="bi bi-check-circle-fill"></i> รับทราบประชาสัมพันธ์แล้ว'
            : '<i class="bi bi-megaphone"></i> กดเพื่อรับทราบประชาสัมพันธ์';

        if (!ann.acknowledged) {
            btn.addEventListener('click', () => {
                ann.acknowledged = true;
                saveData();
                renderAnnouncements();
                openAnnouncementOffcanvas(id); // Re-render offcanvas content
            });
        }
        actionSection.appendChild(btn);
    } else if (ann.type === 'vote') {
        const titleLabel = document.createElement('div');
        titleLabel.className = 'offcanvas-label';
        titleLabel.style.marginBottom = '12px';
        titleLabel.textContent = ann.voted ? 'ผลการโหวตปัจจุบัน' : 'กรุณาเลือกตัวเลือกเพื่อลงคะแนนโหวต';
        actionSection.appendChild(titleLabel);

        const listContainer = document.createElement('div');
        listContainer.className = 'vote-options-list';

        // Calculate total votes
        const totalVotes = Object.values(ann.votes).reduce((sum, val) => sum + val, 0);

        ann.options.forEach(option => {
            const btn = document.createElement('button');
            btn.className = `vote-option-btn ${ann.userVote === option ? 'selected' : ''}`;
            btn.disabled = ann.voted;

            const voteCount = ann.votes[option] || 0;
            const percentage = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;

            btn.innerHTML = `
                <span>${escapeHtml(option)}</span>
                <span>${ann.voted ? `${voteCount} โหวต (${percentage}%)` : ''}</span>
            `;

            if (!ann.voted) {
                btn.addEventListener('click', () => {
                    ann.votes[option] = (ann.votes[option] || 0) + 1;
                    ann.voted = true;
                    ann.userVote = option;
                    saveData();
                    renderAnnouncements();
                    openAnnouncementOffcanvas(id); // Re-render offcanvas content
                });
            }

            listContainer.appendChild(btn);

            if (ann.voted) {
                const bar = document.createElement('div');
                bar.className = 'vote-percentage-bar';
                bar.innerHTML = `<div class="vote-percentage-fill" style="width: ${percentage}%"></div>`;
                listContainer.appendChild(bar);
            }
        });

        actionSection.appendChild(listContainer);
    }

    // Render Edit Announcement button for authorized roles (Admin or Creator)
    const role = state.currentUser ? state.currentUser.role : 'student';
    const isCreatorOrAdmin = (role === 'admin') || (state.currentUser && ann.senderName === state.currentUser.name);
    if (isCreatorOrAdmin) {
        const editBtn = document.createElement('button');
        editBtn.className = 'offcanvas-btn-ack';
        editBtn.style.marginTop = '15px';
        editBtn.style.background = 'var(--accent)';
        editBtn.innerHTML = '<i class="bi bi-pencil-square"></i> แก้ไขข้อมูลประกาศนี้';
        editBtn.onclick = () => {
            closeAnnouncementOffcanvas();
            
            // Prefill modal
            document.getElementById('announcementId').value = ann.id;
            document.getElementById('announcementTitle').value = ann.title;
            document.getElementById('announcementDetail').value = ann.detail;
            document.getElementById('announcementType').value = ann.type;
            document.getElementById('announcementType').onchange();
            if (ann.type === 'vote' && ann.options) {
                document.getElementById('announcementVoteOptions').value = ann.options.join(', ');
            } else {
                document.getElementById('announcementVoteOptions').value = '';
            }
            
            // Show delete button
            document.getElementById('announcementDeleteBtn').style.display = 'block';
            
            document.getElementById('announcementModalOverlay').classList.add('show');
        };
        actionSection.appendChild(editBtn);
    }

    const overlay = document.getElementById('announcementOffcanvasOverlay');
    if (overlay) {
        overlay.classList.add('show');
    }
}

function closeAnnouncementOffcanvas() {
    const overlay = document.getElementById('announcementOffcanvasOverlay');
    if (overlay) {
        overlay.classList.remove('show');
    }
}

function renderHomeActivities() {
    const container = document.getElementById('activitiesHomeList');
    if (!container) return;
    container.innerHTML = '';

    const currentUserId = state.currentUser ? state.currentUser.id : 'u_student1';

    let activities = state.activities;
    if (activeTimeframeFilter === 'today') {
        activities = activities.filter(act => act.id === 'act1');
    }

    activities.forEach(act => {
        const isRegistered = act.participants && act.participants.includes(currentUserId);
        const box = document.createElement('div');
        box.className = `activity-box animate__animated animate__fadeInRight`;
        box.style.cursor = 'pointer';
        box.dataset.id = act.id;

        const badgeHtml = isRegistered
            ? `<span class="badge-responded" style="margin-left: auto; font-size: 0.75rem; background: var(--accent); color: white; padding: 2px 6px; border-radius: 10px;"><i class="bi bi-check-circle-fill"></i> ลงทะเบียนแล้ว</span>`
            : '';

        box.innerHTML = `
            <div class="activity-header">
                <small>${escapeHtml(act.type)}</small>
                <span>${escapeHtml(act.title)}</span>
                ${badgeHtml}
                <i class="bi bi-arrow-up-right" style="${isRegistered ? 'margin-left: 8px;' : ''}"></i>
            </div>
            <div class="activity-detail">
                <span>${escapeHtml(act.time)}</span>
                <div class="activity-create">
                    <img src="${act.creatorImg}" alt="${escapeHtml(act.creatorName)}">
                    <small>${escapeHtml(act.creatorName)}</small>
                </div>
                <span></span>
            </div>
        `;

        box.addEventListener('click', () => {
            openActivityOffcanvas(act.id);
        });

        container.appendChild(box);
    });
}

function openActivityOffcanvas(id) {
    const act = state.activities.find(a => a.id === id);
    if (!act) return;

    // Fill content
    document.getElementById('activityOffcanvasTitle').textContent = act.title;
    document.getElementById('activityOffcanvasCreatorImg').src = act.creatorImg;
    document.getElementById('activityOffcanvasCreatorName').textContent = act.creatorName;
    document.getElementById('activityOffcanvasTime').textContent = act.time;
    document.getElementById('activityOffcanvasContent').textContent = act.detail;
    
    // Set cover image
    const coverImg = document.getElementById('activityOffcanvasCover');
    if (coverImg) {
        if (act.image) {
            coverImg.src = act.image;
            coverImg.style.display = 'block';
        } else {
            coverImg.style.display = 'none';
        }
    }

    const currentUserId = state.currentUser ? state.currentUser.id : 'u_student1';
    const isRegistered = act.participants && act.participants.includes(currentUserId);

    // Update participants list
    const participantCount = document.getElementById('activityParticipantCount');
    if (participantCount) {
        participantCount.textContent = act.participants ? act.participants.length : 0;
    }

    const participantList = document.getElementById('activityParticipantList');
    if (participantList) {
        participantList.innerHTML = '';
        if (act.participants && act.participants.length > 0) {
            act.participants.forEach(pId => {
                const user = state.users.find(u => u.id === pId);
                const name = user ? user.name : 'นักเรียน';
                const photo = user ? user.photo : 'https://cdn.jsdelivr.net/gh/JacketJK/image/student.png';
                
                const badge = document.createElement('span');
                badge.className = 'participant-avatar-badge';
                badge.innerHTML = `<img src="${photo}" alt="${escapeHtml(name)}"> <small>${escapeHtml(name)}</small>`;
                participantList.appendChild(badge);
            });
        } else {
            participantList.innerHTML = '<span style="color: var(--text-muted); font-size: 0.85rem;">ยังไม่มีผู้ลงทะเบียน</span>';
        }
    }

    const actionSection = document.getElementById('activityOffcanvasActionSection');
    actionSection.innerHTML = '';

    const btn = document.createElement('button');
    if (isRegistered) {
        btn.className = 'offcanvas-btn-ack done';
        btn.innerHTML = '<i class="bi bi-x-circle-fill"></i> ยกเลิกการลงทะเบียน';
        btn.addEventListener('click', () => {
            act.participants = act.participants.filter(pId => pId !== currentUserId);
            saveData();
            renderHomeActivities();
            openActivityOffcanvas(id); // Re-render offcanvas
        });
    } else {
        btn.className = 'offcanvas-btn-ack';
        btn.innerHTML = '<i class="bi bi-person-plus-fill"></i> ลงทะเบียนเข้าร่วมกิจกรรม';
        btn.addEventListener('click', () => {
            if (!act.participants) act.participants = [];
            if (!act.participants.includes(currentUserId)) {
                act.participants.push(currentUserId);
            }
            saveData();
            renderHomeActivities();
            openActivityOffcanvas(id); // Re-render offcanvas
        });
    }
    actionSection.appendChild(btn);

    const overlay = document.getElementById('activityOffcanvasOverlay');
    if (overlay) {
        overlay.classList.add('show');
    }
}

function closeActivityOffcanvas() {
    const overlay = document.getElementById('activityOffcanvasOverlay');
    if (overlay) {
        overlay.classList.remove('show');
    }
}

function wireActivityOffcanvas() {
    const closeBtn = document.getElementById('activityOffcanvasClose');
    const overlay = document.getElementById('activityOffcanvasOverlay');

    if (closeBtn) {
        closeBtn.addEventListener('click', closeActivityOffcanvas);
    }

    if (overlay) {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                closeActivityOffcanvas();
            }
        });
    }
}

/* ============================================================
   12. ADMIN VIEW LOGIC (User Management)
   ============================================================ */
let academicChartObj = null;

function initAdminView() {
    renderAdminUserTable();
    wireAdminUserModal();
}

function renderAdminUserTable() {
    const tbody = document.getElementById('adminUserTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    state.users.forEach(user => {
        const tr = document.createElement('tr');
        
        let metaInfo = '-';
        if (user.role === 'subject_teacher') {
            metaInfo = `วิชา: ${user.subjects ? user.subjects.join(', ') : '-'} (ห้อง ${user.classRooms ? user.classRooms.join(', ') : '-'})`;
        } else if (user.role === 'homeroom_teacher') {
            metaInfo = `ห้อง: ${user.classRooms ? user.classRooms.join(', ') : '-'}`;
        } else if (user.role === 'student') {
            metaInfo = `ห้อง: ${user.classRoomId || '-'}`;
        }

        let roleBadge = `<span class="badge-role student">นักเรียน</span>`;
        if (user.role === 'admin') roleBadge = `<span class="badge-role admin">แอดมิน</span>`;
        else if (user.role === 'subject_teacher') roleBadge = `<span class="badge-role teacher">ครูประจำวิชา</span>`;
        else if (user.role === 'homeroom_teacher') roleBadge = `<span class="badge-role teacher">ครูประจำชั้น</span>`;
        else if (user.role === 'academic_affairs') roleBadge = `<span class="badge-role academic">ฝ่ายวิชาการ</span>`;
        else if (user.role === 'discipline_affairs') roleBadge = `<span class="badge-role discipline">ฝ่ายปกครอง</span>`;

        tr.innerHTML = `
            <td>
                <div style="display:flex; align-items:center; gap:8px;">
                    <img src="${user.photo || 'https://cdn.jsdelivr.net/gh/JacketJK/image/student.png'}" style="width:30px; height:30px; border-radius:50%; object-fit:cover;">
                    <strong>${escapeHtml(user.name)}</strong>
                </div>
            </td>
            <td><code>${escapeHtml(user.username)}</code></td>
            <td>${roleBadge}</td>
            <td><small>${escapeHtml(metaInfo)}</small></td>
            <td>
                <button class="btn-att-status active present" style="padding: 4px 8px; font-size:11px;" onclick="openUserModal('${user.id}')"><i class="bi bi-pencil-square"></i> แก้ไข</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function wireAdminUserModal() {
    const modal = document.getElementById('userModalOverlay');
    const closeBtn = document.getElementById('userModalClose');
    const cancelBtn = document.getElementById('userCancelBtn');
    const roleSelect = document.getElementById('userRoleSelect');
    const form = document.getElementById('userForm');
    
    document.getElementById('adminAddUserBtn').onclick = () => openUserModal(null);
    closeBtn.onclick = () => modal.classList.remove('show');
    cancelBtn.onclick = () => modal.classList.remove('show');
    
    roleSelect.onchange = () => {
        const role = roleSelect.value;
        document.getElementById('userSubjectGroup').style.display = (role === 'subject_teacher' || role === 'homeroom_teacher') ? 'block' : 'none';
        document.getElementById('userClassroomGroup').style.display = (role === 'student' || role === 'subject_teacher' || role === 'homeroom_teacher') ? 'block' : 'none';
    };

    form.onsubmit = (e) => {
        e.preventDefault();
        const id = document.getElementById('userIdInput').value;
        const name = document.getElementById('userNameInput').value.trim();
        const userVal = document.getElementById('userUsernameInput').value.trim();
        const passVal = document.getElementById('userPasswordInput').value.trim();
        const role = roleSelect.value;
        
        const subjects = document.getElementById('userSubjectsInput').value.split(',').map(s => s.trim()).filter(s => s);
        const classRooms = document.getElementById('userClassroomsInput').value.split(',').map(c => c.trim()).filter(c => c);

        if (id) {
            const user = state.users.find(u => u.id === id);
            if (user) {
                user.name = name;
                user.username = userVal;
                user.password = passVal;
                user.role = role;
                user.subjects = subjects;
                user.classRooms = classRooms;
                if (role === 'student') user.classRoomId = classRooms[0] || 'c_p6_1';
            }
        } else {
            const newUser = {
                id: uid(),
                name,
                username: userVal,
                password: passVal,
                role,
                subjects,
                classRooms,
                photo: role === 'student' ? 'https://cdn.jsdelivr.net/gh/JacketJK/image/student.png' : 'https://cdn.jsdelivr.net/gh/JacketJK/image/user-2.png'
            };
            if (role === 'student') newUser.classRoomId = classRooms[0] || 'c_p6_1';
            state.users.push(newUser);
        }

        saveData();
        modal.classList.remove('show');
        renderAdminUserTable();
    };

    document.getElementById('userDeleteBtn').onclick = () => {
        const id = document.getElementById('userIdInput').value;
        if (!id) return;
        if (!confirm('ยืนยันที่จะลบบัญชีผู้ใช้นี้ออกจากระบบ?')) return;
        state.users = state.users.filter(u => u.id !== id);
        saveData();
        modal.classList.remove('show');
        renderAdminUserTable();
    };
}

window.openUserModal = function(id) {
    const modal = document.getElementById('userModalOverlay');
    const form = document.getElementById('userForm');
    const deleteBtn = document.getElementById('userDeleteBtn');
    
    form.reset();
    modal.classList.add('show');
    
    if (id) {
        const user = state.users.find(u => u.id === id);
        document.getElementById('userModalTitle').textContent = 'แก้ไขบัญชีผู้ใช้';
        document.getElementById('userIdInput').value = user.id;
        document.getElementById('userNameInput').value = user.name;
        document.getElementById('userUsernameInput').value = user.username;
        document.getElementById('userPasswordInput').value = user.password;
        document.getElementById('userRoleSelect').value = user.role;
        document.getElementById('userSubjectsInput').value = user.subjects ? user.subjects.join(', ') : '';
        document.getElementById('userClassroomsInput').value = user.classRooms ? user.classRooms.join(', ') : (user.classRoomId || '');
        
        deleteBtn.style.display = 'block';
        document.getElementById('userRoleSelect').onchange();
    } else {
        document.getElementById('userModalTitle').textContent = 'เพิ่มผู้ใช้ใหม่';
        document.getElementById('userIdInput').value = '';
        deleteBtn.style.display = 'none';
        document.getElementById('userRoleSelect').onchange();
    }
};

/* ============================================================
   13. ACADEMIC VIEW LOGIC
   ============================================================ */
function initAcademicView() {
    renderAcademicSubjects();
    renderAcademicChart();

    document.getElementById('academicAddSubjectBtn').onclick = () => {
        const name = document.getElementById('academicNewSubjectInput').value.trim();
        if (!name) return;
        if (state.subjects.includes(name)) {
            alert('มีวิชานี้อยู่ในระบบแล้ว');
            return;
        }

        state.subjects.push(name);
        // Initialize default scores for this subject
        state.users.filter(u => u.role === 'student').forEach(stud => {
            state.studentGrades[stud.id] = state.studentGrades[stud.id] || {};
            state.studentGrades[stud.id][name] = { previous: 0, current: 0 };
        });

        saveData();
        document.getElementById('academicNewSubjectInput').value = '';
        renderAcademicSubjects();
        renderAcademicChart();
        populateSubjectFilter();
    };
}

function renderAcademicSubjects() {
    const container = document.getElementById('academicSubjectsList');
    if (!container) return;
    container.innerHTML = '';

    state.subjects.forEach(subject => {
        const div = document.createElement('div');
        div.style.display = 'flex';
        div.style.justifyContent = 'space-between';
        div.style.padding = '8px 12px';
        div.style.background = 'rgba(0,0,0,0.02)';
        div.style.borderRadius = '8px';
        div.style.marginBottom = '8px';
        div.innerHTML = `
            <span>${escapeHtml(subject)}</span>
            <i class="bi bi-trash3 text-accent" style="cursor:pointer;" onclick="deleteAcademicSubject('${escapeHtml(subject)}')"></i>
        `;
        container.appendChild(div);
    });
}

window.deleteAcademicSubject = function(subject) {
    if (!confirm(`ต้องการลบวิชา ${subject} และคะแนนสะสมทั้งหมดหรือไม่?`)) return;
    state.subjects = state.subjects.filter(s => s !== subject);
    
    // Clear subject grades
    Object.keys(state.studentGrades).forEach(sId => {
        delete state.studentGrades[sId][subject];
    });

    saveData();
    renderAcademicSubjects();
    renderAcademicChart();
    populateSubjectFilter();
};

function renderAcademicChart() {
    const chartDiv = document.querySelector('#academicGradesReportChart');
    if (!chartDiv) return;

    const subjects = state.subjects;
    const averages = subjects.map(s => {
        const studentIds = Object.keys(state.studentGrades);
        let sum = 0, count = 0;
        studentIds.forEach(id => {
            if (state.studentGrades[id] && state.studentGrades[id][s]) {
                sum += state.studentGrades[id][s].current || 0;
                count++;
            }
        });
        return count > 0 ? Math.round(sum / count) : 0;
    });

    const options = {
        series: [{ name: 'คะแนนเฉลี่ยรวม', data: averages }],
        chart: {
            height: 250,
            type: 'bar',
            fontFamily: 'Prompt, sans-serif',
            toolbar: { show: false }
        },
        colors: [state.accentColor || '#000000'],
        plotOptions: {
            bar: {
                borderRadius: 4,
                horizontal: false,
            }
        },
        dataLabels: { enabled: true },
        xaxis: {
            categories: subjects,
        }
    };

    if (academicChartObj) {
        academicChartObj.updateOptions(options);
    } else {
        academicChartObj = new ApexCharts(chartDiv, options);
        academicChartObj.render();
    }
}

/* ============================================================
   14. HOMEROOM VIEW LOGIC
   ============================================================ */
let activeHomeroomTab = 'attendance';

function initHomeroomView() {
    renderHomeroomDashboard();
    renderHomeroomTab();
    wireHomeroomTabs();
}

function renderHomeroomDashboard() {
    // Stats calculation
    const students = state.users.filter(u => u.role === 'student' && u.classRoomId === 'c_p6_1');
    document.getElementById('homeroomStudentCount').textContent = `${students.length} คน`;

    // Average GPA
    let gpaSum = 0;
    students.forEach(stud => {
        const grades = state.studentGrades[stud.id] || {};
        let scoreSum = 0, count = 0;
        state.subjects.forEach(s => {
            if (grades[s]) {
                scoreSum += grades[s].current || 0;
                count++;
            }
        });
        const avg = count > 0 ? scoreSum / count : 0;
        // Convert to GPA logic: 80+=4, 70+=3, 60+=2, 50+=1, 50-=0
        let gpaVal = 0;
        if (avg >= 80) gpaVal = 4;
        else if (avg >= 70) gpaVal = 3;
        else if (avg >= 60) gpaVal = 2;
        else if (avg >= 50) gpaVal = 1;
        gpaSum += gpaVal;
    });

    const classGpa = students.length > 0 ? (gpaSum / students.length).toFixed(2) : '0.00';
    document.getElementById('homeroomClassGpa').textContent = classGpa;

    // Today Attendance Rate
    const today = new Date().toISOString().split('T')[0];
    const presentCount = state.attendance.filter(a => a.date === today && a.status === 'present').length;
    const rate = students.length > 0 ? Math.round((presentCount / students.length) * 100) : 100;
    document.getElementById('homeroomAttendanceRate').textContent = `${rate}%`;
}

function wireHomeroomTabs() {
    const attBtn = document.getElementById('btnTabHomeroomAttendance');
    const behBtn = document.getElementById('btnTabHomeroomBehavior');

    attBtn.onclick = () => {
        attBtn.classList.add('active');
        behBtn.classList.remove('active');
        activeHomeroomTab = 'attendance';
        renderHomeroomTab();
    };

    behBtn.onclick = () => {
        behBtn.classList.add('active');
        attBtn.classList.remove('active');
        activeHomeroomTab = 'behavior';
        renderHomeroomTab();
    };
}

function renderHomeroomTab() {
    const attSec = document.getElementById('homeroomAttendanceSection');
    const behSec = document.getElementById('homeroomBehaviorSection');
    
    if (activeHomeroomTab === 'attendance') {
        attSec.style.display = 'block';
        behSec.style.display = 'none';
        renderHomeroomAttendanceTable();
    } else {
        attSec.style.display = 'none';
        behSec.style.display = 'block';
        renderHomeroomBehaviorTable();
    }
}

function renderHomeroomAttendanceTable() {
    const tbody = document.getElementById('homeroomAttendanceTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    const students = state.users.filter(u => u.role === 'student' && u.classRoomId === 'c_p6_1');
    const today = new Date().toISOString().split('T')[0];

    students.forEach(stud => {
        const att = state.attendance.find(a => a.date === today && a.studentId === stud.id) || { status: 'present' };
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${escapeHtml(stud.name)}</strong></td>
            <td>
                <div class="attendance-checkbox-group">
                    <button class="btn-att-status ${att.status === 'present' ? 'active present' : ''}" onclick="toggleAttendance('${stud.id}', 'present')">มาเรียน</button>
                    <button class="btn-att-status ${att.status === 'absent' ? 'active absent' : ''}" onclick="toggleAttendance('${stud.id}', 'absent')">ขาดเรียน</button>
                    <button class="btn-att-status ${att.status === 'late' ? 'active late' : ''}" onclick="toggleAttendance('${stud.id}', 'late')">สาย</button>
                    <button class="btn-att-status ${att.status === 'sick' ? 'active sick' : ''}" onclick="toggleAttendance('${stud.id}', 'sick')">ลาป่วย</button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

window.toggleAttendance = function(studentId, status) {
    const today = new Date().toISOString().split('T')[0];
    const stud = state.users.find(u => u.id === studentId);
    if (!stud) return;

    let att = state.attendance.find(a => a.date === today && a.studentId === studentId);
    if (att) {
        att.status = status;
    } else {
        state.attendance.push({
            id: uid(),
            date: today,
            studentId,
            studentName: stud.name,
            status
        });
    }

    saveData();
    renderHomeroomAttendanceTable();
    renderHomeroomDashboard();
};

function renderHomeroomBehaviorTable() {
    const tbody = document.getElementById('homeroomBehaviorTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    const students = state.users.filter(u => u.role === 'student' && u.classRoomId === 'c_p6_1');

    students.forEach(stud => {
        // Sum behavior logs
        const studentLogs = state.behaviorLogs.filter(l => l.studentId === stud.id);
        const score = 100 + studentLogs.reduce((sum, l) => sum + l.points, 0);

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${escapeHtml(stud.name)}</strong></td>
            <td><strong style="color: ${score >= 100 ? '#28a745' : '#dc3545'}">${score} คะแนน</strong></td>
            <td>
                <div style="display:flex; gap:8px; align-items:center;">
                    <input type="text" class="form-control" style="width: 150px; padding: 4px 8px;" placeholder="เหตุผล..." id="reason-${stud.id}">
                    <button class="btn-att-status active present" style="padding: 6px 12px;" onclick="adjustBehavior('${stud.id}', 5)">+5</button>
                    <button class="btn-att-status active absent" style="padding: 6px 12px;" onclick="adjustBehavior('${stud.id}', -5)">-5</button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

window.adjustBehavior = function(studentId, points) {
    const stud = state.users.find(u => u.id === studentId);
    if (!stud) return;

    const input = document.getElementById(`reason-${studentId}`);
    const reason = input ? input.value.trim() : '';

    if (!reason) {
        alert('กรุณากรอกเหตุผลในการปรับปรุงคะแนน');
        return;
    }

    state.behaviorLogs.push({
        id: uid(),
        studentId,
        studentName: stud.name,
        points,
        reason,
        date: new Date().toISOString().split('T')[0],
        createdBy: state.currentUser ? state.currentUser.name : 'ระบบ'
    });

    saveData();
    alert('บันทึกคะแนนพฤติกรรมเรียบร้อยแล้ว');
    if (input) input.value = '';
    renderHomeroomBehaviorTable();
};

/* ============================================================
   15. DISCIPLINE VIEW LOGIC
   ============================================================ */
function initDisciplineView() {
    const tbody = document.getElementById('disciplineBehaviorLogTableBody');
    if (!tbody) return;

    // Populate student dropdown selector
    const studentSelect = document.getElementById('disciplineStudentSelect');
    if (studentSelect) {
        studentSelect.innerHTML = '';
        const students = state.users.filter(u => u.role === 'student');
        students.forEach(stud => {
            const opt = document.createElement('option');
            opt.value = stud.id;
            opt.textContent = `${stud.name} (${stud.classRoomId ? state.classRooms.find(c => c.id === stud.classRoomId)?.name || stud.classRoomId : 'ไม่มีห้อง'})`;
            studentSelect.appendChild(opt);
        });
    }

    // Handle form submission
    const form = document.getElementById('disciplineLogForm');
    if (form) {
        form.onsubmit = (e) => {
            e.preventDefault();
            const studentId = document.getElementById('disciplineStudentSelect').value;
            const points = parseInt(document.getElementById('disciplinePointsSelect').value) || 0;
            const reason = document.getElementById('disciplineReasonInput').value.trim();

            const stud = state.users.find(u => u.id === studentId);
            if (!stud) return;

            state.behaviorLogs.push({
                id: uid(),
                studentId,
                studentName: stud.name,
                points,
                reason,
                date: new Date().toISOString().split('T')[0],
                createdBy: state.currentUser ? state.currentUser.name : 'ฝ่ายปกครอง'
            });

            saveData();
            alert('บันทึกคะแนนพฤติกรรมเรียบร้อยแล้ว');
            document.getElementById('disciplineReasonInput').value = '';
            initDisciplineView(); // Refresh table view
        };
    }

    tbody.innerHTML = '';

    // Sort by date descending
    const logs = [...state.behaviorLogs].sort((a,b) => b.date.localeCompare(a.date));

    logs.forEach(log => {
        const tr = document.createElement('tr');
        const color = log.points > 0 ? '#28a745' : '#dc3545';
        const sign = log.points > 0 ? `+${log.points}` : log.points;

        tr.innerHTML = `
            <td><code>${escapeHtml(log.date)}</code></td>
            <td><strong>${escapeHtml(log.studentName)}</strong></td>
            <td><strong style="color: ${color}">${sign}</strong></td>
            <td>${escapeHtml(log.reason)}</td>
            <td><small>${escapeHtml(log.createdBy)}</small></td>
        `;
        tbody.appendChild(tr);
    });
}

function renderTopBarMenus() {
    // 1. Messages
    const msgBadge = document.getElementById('envelope-badge');
    const msgContainer = document.getElementById('messages-list-container');
    const unreadMsgs = state.messages.filter(m => !m.read).length;
    
    if (msgBadge) {
        if (unreadMsgs > 0) {
            msgBadge.textContent = unreadMsgs;
            msgBadge.style.display = 'block';
        } else {
            msgBadge.style.display = 'none';
        }
    }

    if (msgContainer) {
        if (state.messages.length === 0) {
            msgContainer.innerHTML = '<div style="padding: 16px; text-align: center; color: #999; font-size: 13px;">ไม่มีข้อความใหม่</div>';
        } else {
            msgContainer.innerHTML = state.messages.map(m => `
                <div class="dropdown-item-custom ${m.read ? '' : 'unread'}" data-msg-id="${m.id}">
                    <img src="${m.senderImg}" alt="${m.senderName}">
                    <div class="dropdown-item-content">
                        <div class="dropdown-item-title">${escapeHtml(m.senderName)}</div>
                        <div class="dropdown-item-desc">${escapeHtml(m.preview)}</div>
                        <div class="dropdown-item-time">${escapeHtml(m.time)}</div>
                    </div>
                </div>
            `).join('');

            // Add click listeners to items
            msgContainer.querySelectorAll('.dropdown-item-custom').forEach(item => {
                item.addEventListener('click', () => {
                    const msgId = item.getAttribute('data-msg-id');
                    const msg = state.messages.find(m => m.id === msgId);
                    if (msg) {
                        msg.read = true;
                        saveData();
                        renderTopBarMenus();
                    }
                    // Take to People view
                    window.location.hash = 'people';
                });
            });
        }
    }

    // 2. Notifications
    const bellBadge = document.getElementById('bell-badge');
    const bellContainer = document.getElementById('notifications-list-container');
    const unreadNotifs = state.notifications.filter(n => !n.read).length;

    if (bellBadge) {
        if (unreadNotifs > 0) {
            bellBadge.textContent = unreadNotifs;
            bellBadge.style.display = 'block';
        } else {
            bellBadge.style.display = 'none';
        }
    }

    if (bellContainer) {
        if (state.notifications.length === 0) {
            bellContainer.innerHTML = '<div style="padding: 16px; text-align: center; color: #999; font-size: 13px;">ไม่มีการแจ้งเตือน</div>';
        } else {
            bellContainer.innerHTML = state.notifications.map(n => {
                let iconClass = 'bi-info-circle';
                if (n.type === 'homework') iconClass = 'bi-journal-check';
                if (n.type === 'announcement') iconClass = 'bi-megaphone';
                if (n.type === 'grade') iconClass = 'bi-clipboard-pulse';

                return `
                    <div class="dropdown-item-custom ${n.read ? '' : 'unread'}" data-notif-id="${n.id}">
                        <div style="font-size: 20px; color: var(--accent-color, #091e21); display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: 50%; background: rgba(9, 30, 33, 0.08);">
                            <i class="bi ${iconClass}"></i>
                        </div>
                        <div class="dropdown-item-content">
                            <div class="dropdown-item-title">${escapeHtml(n.title)}</div>
                            <div class="dropdown-item-desc">${escapeHtml(n.desc)}</div>
                            <div class="dropdown-item-time">${escapeHtml(n.time)}</div>
                        </div>
                    </div>
                `;
            }).join('');

            // Add click listeners to items
            bellContainer.querySelectorAll('.dropdown-item-custom').forEach(item => {
                item.addEventListener('click', () => {
                    const notifId = item.getAttribute('data-notif-id');
                    const notif = state.notifications.find(n => n.id === notifId);
                    if (notif) {
                        notif.read = true;
                        saveData();
                        renderTopBarMenus();

                        // Route based on type
                        if (notif.type === 'homework') {
                            window.location.hash = 'home';
                        } else if (notif.type === 'announcement') {
                            window.location.hash = 'home';
                        } else if (notif.type === 'grade') {
                            window.location.hash = 'grades';
                        }
                    }
                });
            });
        }
    }
}