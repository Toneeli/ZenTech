import React, { useState, useEffect } from 'react';
import { User, UserRole, UserStatus, VoteItem } from './types';
import { SuperAdminDashboard } from './components/SuperAdminDashboard';
import { BuildingAdminDashboard } from './components/BuildingAdminDashboard';
import { OwnerDashboard } from './components/OwnerDashboard';
import { PublicLanding } from './components/PublicLanding';
import { AuthModal } from './components/AuthModal';
import { Badge, Button } from './components/ui';
import { Building, LogOut } from 'lucide-react';

// --- MOCK DATA INITIALIZATION ---

// Initial Admin User (Hardcoded Requirement)
const ADMIN_USER: User = {
  id: 'sys-admin-001',
  name: '系统管理员',
  role: UserRole.SUPER_ADMIN,
  building: '物业中心',
  unit: 'Admin',
  status: UserStatus.VERIFIED,
  phoneNumber: '18688835658',
  password: '895600'
};

const INITIAL_MOCK_USERS: User[] = [
  ADMIN_USER,
  // --- Building 1 Group ---
  // Admin for Building 1
  { 
    id: 'u-b1-admin', 
    name: '李明（1号楼管家）', 
    role: UserRole.BUILDING_ADMIN, 
    building: '1号楼', 
    unit: '101', 
    managedBuilding: '1号楼', 
    status: UserStatus.VERIFIED, 
    phoneNumber: '13900000001', 
    password: 'password' 
  },
  // Owner in Building 1 (Set to PENDING for initial 0 count)
  { 
    id: 'u-b1-owner1', 
    name: '张伟', 
    role: UserRole.OWNER, 
    building: '1号楼', 
    unit: '305', 
    status: UserStatus.PENDING, 
    phoneNumber: '13900000002', 
    password: 'password' 
  },
  // Pending Owner in Building 1
  { 
    id: 'u-b1-owner2', 
    name: '王芳', 
    role: UserRole.OWNER, 
    building: '1号楼', 
    unit: '602', 
    status: UserStatus.PENDING, 
    phoneNumber: '13900000003', 
    password: 'password' 
  },

  // --- Building 2 Group ---
  // Admin for Building 2
  { 
    id: 'u-b2-admin', 
    name: '刘强（2号楼管家）', 
    role: UserRole.BUILDING_ADMIN, 
    building: '2号楼', 
    unit: '202', 
    managedBuilding: '2号楼', 
    status: UserStatus.VERIFIED, 
    phoneNumber: '13900000004', 
    password: 'password' 
  },
  // Owner in Building 2 (Set to PENDING)
  { 
    id: 'u-b2-owner1', 
    name: '陈静', 
    role: UserRole.OWNER, 
    building: '2号楼', 
    unit: '505', 
    status: UserStatus.PENDING, 
    phoneNumber: '13900000005', 
    password: 'password' 
  },

  // --- Orphaned Group (Building 3 has no admin) ---
  // Pending Owner in Building 3
  { 
    id: 'u-b3-owner1', 
    name: '赵强（无管家）', 
    role: UserRole.OWNER, 
    building: '3号楼', 
    unit: '808', 
    status: UserStatus.PENDING, 
    phoneNumber: '13900000006', 
    password: 'password' 
  },
  // Owner in Building 3 (Set to PENDING)
  { 
    id: 'u-b3-owner2', 
    name: '孙丽', 
    role: UserRole.OWNER, 
    building: '3号楼', 
    unit: '909', 
    status: UserStatus.PENDING, 
    phoneNumber: '13900000007', 
    password: 'password' 
  },
];

const generateMockVotes = (): VoteItem[] => {
  const topics = [
    { title: '2024年度物业服务费用调整方案', desc: '鉴于人工及物料成本上涨，拟对现有物业费标准进行微调，调整幅度为0.2元/平米。' },
    { title: '地下车库增加新能源汽车充电桩', desc: '计划在B2层F区增设20个国家电网标准快充桩，解决业主充电难问题。' },
    { title: '小区门禁系统升级人脸识别', desc: '现有刷卡门禁反应迟钝，建议全面升级为AI人脸识别系统，提升安全性与便捷性。' },
    { title: '增设垃圾分类定时投放点', desc: '响应政府号召，拟在3号楼北侧增设一处智能垃圾分类投放站。' },
    { title: '电梯广告收益公示及使用方案', desc: '关于本年度电梯内框架广告及视频广告收益的公示及用于年底给业主发米油的提案。' },
    { title: '地下车库照明节能改造工程', desc: '将车库现有日光灯管全部更换为雷达感应LED灯，预计年节电40%。' },
    { title: '儿童游乐区设施翻新计划', desc: '中心花园儿童滑梯老化严重，存在安全隐患，申请维修基金进行整体更换。' },
    { title: '小区绿化补种及景观提升', desc: '针对大门口及主干道两侧枯死植被进行补种，并增加时令花卉。' },
    { title: '关于严禁电动自行车上楼入户的公约', desc: '为消除火灾隐患，拟在每栋楼大厅安装阻车系统，强制禁止电瓶车进入电梯。' },
    { title: '增设丰巢智能快递柜', desc: '现有快递柜已饱和，拟在西门入口处新增一组快递柜。' },
    { title: '调整路灯及景观灯开启时间', desc: '夏季建议延后开启路灯时间至19:30，以节约公共用电。' },
    { title: '文明养宠及宠物粪便清理规定', desc: '制定详细的养犬管理公约，并增设宠物便便箱。' },
    { title: '春节小区氛围装饰预算审批', desc: '申请2万元预算用于购买灯笼、中国结等装饰品，营造节日氛围。' },
    { title: '篮球场开放时间调整', desc: '为避免扰民，建议将篮球场晚间关闭时间从22:00调整为21:00。' },
    { title: '楼道杂物清理专项行动', desc: '授权物业对长期堆放在消防通道的私人物品进行强制清理。' },
    { title: '二次供水水箱清洗时间确认', desc: '拟定于下周二对全小区生活水箱进行清洗消毒，期间将停水8小时。' },
    { title: '增加夜间安保巡逻频次', desc: '建议在凌晨2:00-5:00期间，将巡逻频次由每2小时一次增加至每小时一次。' },
    { title: '社区活动中心用途征集', desc: '6号楼架空层闲置空间拟改建为老年棋牌室或青年读书角。' },
    { title: '外墙渗水维修基金使用公示', desc: '针对A栋西侧外墙严重渗水问题，启动紧急维修基金程序。' },
    { title: '新一届业主委员会换届选举筹备', desc: '现届业委会任期将满，成立换届筹备组并推选业主代表。' },
  ];

  return topics.map((t, i) => ({
    id: `v-mock-${i}`,
    title: t.title,
    description: t.desc,
    createdAt: new Date().toISOString(),
    deadline: new Date(Date.now() + 86400000 * (Math.floor(Math.random() * 10) + 1)).toISOString(),
    status: 'active',
    totalVotes: 0, // Initial votes set to 0
    votedUserIds: [], 
    isVisible: true,
    order: i,
    options: [
      { id: `opt1`, label: '同意', count: 0 },
      { id: `opt2`, label: '反对', count: 0 },
      { id: `opt3`, label: '弃权', count: 0 }
    ]
  }));
};

const MOCK_VOTES_INITIAL = generateMockVotes();

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  // State for data
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('app_users');
    return saved ? JSON.parse(saved) : INITIAL_MOCK_USERS;
  });
  const [votes, setVotes] = useState<VoteItem[]>(() => {
    const saved = localStorage.getItem('app_votes');
    return saved ? JSON.parse(saved) : MOCK_VOTES_INITIAL;
  });

  // Persistence
  useEffect(() => {
    localStorage.setItem('app_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('app_votes', JSON.stringify(votes));
  }, [votes]);

  // Computed stats
  // Only count verified OWNERS (excluding admins) for the public statistic to start at 0
  const verifiedUserCount = users.filter(u => u.role === UserRole.OWNER && u.status === UserStatus.VERIFIED).length;
  const totalVotesCast = votes.reduce((acc, vote) => acc + vote.totalVotes, 0);

  // -- AUTH ACTIONS --

  const handleLogin = async (phone: string, pass: string): Promise<boolean> => {
    // Simulate API delay
    await new Promise(r => setTimeout(r, 500));
    
    const user = users.find(u => u.phoneNumber === phone && u.password === pass);
    if (user) {
      setCurrentUser(user);
      setShowAuthModal(false);
      return true;
    }
    return false;
  };

  const handleRegister = async (data: any): Promise<boolean> => {
    await new Promise(r => setTimeout(r, 500));

    // Check duplicate phone
    if (users.some(u => u.phoneNumber === data.phone)) {
      return false;
    }

    const newUser: User = {
      id: `u-${Date.now()}`,
      name: data.name,
      role: UserRole.OWNER, // Default role is OWNER
      building: data.building,
      unit: data.unit,
      status: UserStatus.PENDING, // Pending verification
      phoneNumber: data.phone,
      password: data.password
    };

    setUsers(prev => [...prev, newUser]);
    return true;
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const handleChangePassword = (newPass: string) => {
    if(!currentUser) return;
    // Update local state and current user state
    setUsers(prev => prev.map(u => u.id === currentUser.id ? {...u, password: newPass} : u));
    setCurrentUser(prev => prev ? {...prev, password: newPass} : null);
  };

  // -- ADMIN ACTIONS --
  
  // Super Admin: Create Vote
  const handleCreateVote = (newVote: VoteItem) => {
    setVotes(prev => [newVote, ...prev]);
  };

  // Super Admin: Close Vote
  const handleCloseVote = (id: string) => {
    setVotes(prev => prev.map(v => v.id === id ? { ...v, status: 'closed' } : v));
  };

  // Edit Vote
  const handleEditVote = (id: string, updates: Partial<VoteItem>) => {
    setVotes(prev => prev.map(v => v.id === id ? { ...v, ...updates } : v));
  };

  // Toggle Visibility
  const handleToggleVisibility = (id: string) => {
    setVotes(prev => prev.map(v => v.id === id ? { ...v, isVisible: !v.isVisible } : v));
  };

  // Reorder Votes
  const handleReorderVotes = (newOrder: VoteItem[]) => {
    setVotes(newOrder);
  };

  // Super Admin: Promote/Demote Roles
  const handleToggleRole = (userId: string, newRole: UserRole, managedBuilding?: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        return { 
          ...u, 
          role: newRole,
          // If becoming admin, set managed building. If demoting, clear it.
          managedBuilding: newRole === UserRole.BUILDING_ADMIN ? managedBuilding : undefined
        };
      }
      return u;
    }));
  };

  // Building Admin / Super Admin: Verify User
  const handleVerifyUser = (userId: string, isApproved: boolean) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        return { ...u, status: isApproved ? UserStatus.VERIFIED : UserStatus.REJECTED };
      }
      return u;
    }));
  };

  // Building Admin / Super Admin: Remove/Deregister User
  const handleRemoveUser = (userId: string) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
  };

  // Super Admin: Edit User Details
  const handleEditUser = (userId: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...updates } : u));
  };

  // Super Admin: Import Users
  const handleImportUsers = (importedUsers: Partial<User>[]) => {
    const newUsers: User[] = [];
    const timestamp = Date.now();
    
    importedUsers.forEach((user, index) => {
      // Basic validation: must have phone number
      if (!user.phoneNumber) return;
      
      // Check duplicate in existing users
      if (users.some(u => u.phoneNumber === user.phoneNumber) || newUsers.some(u => u.phoneNumber === user.phoneNumber)) {
        return;
      }

      newUsers.push({
        id: `u-imported-${timestamp}-${index}`,
        name: user.name || '未命名',
        role: UserRole.OWNER,
        building: user.building || '未知',
        unit: user.unit || '未知',
        status: UserStatus.VERIFIED, // Auto-verified if imported by admin
        phoneNumber: user.phoneNumber,
        password: user.password || '123456' // Default password
      } as User);
    });

    if (newUsers.length > 0) {
      setUsers(prev => [...prev, ...newUsers]);
    }
  };

  // Owner: Vote
  const handleVote = (voteId: string, optionId: string) => {
    if (!currentUser) return;

    setVotes(prev => prev.map(v => {
      if (v.id === voteId) {
        if (v.votedUserIds.includes(currentUser.id)) return v; // Already voted

        return {
          ...v,
          totalVotes: v.totalVotes + 1,
          votedUserIds: [...v.votedUserIds, currentUser.id],
          options: v.options.map(opt => opt.id === optionId ? { ...opt, count: opt.count + 1 } : opt)
        };
      }
      return v;
    }));
  };

  // Filter votes for Public view (Only Active & Visible)
  const publicVotes = votes
    .filter(v => v.isVisible !== false && v.status === 'active') // Filter out closed votes
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  // Filter votes for Owner view (Only Visible, separation done inside component)
  const ownerVotes = votes
    .filter(v => v.isVisible !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  // 1. Unauthenticated: Public Landing + Auth Modal
  if (!currentUser) {
    return (
      <>
        <PublicLanding 
          votes={publicVotes} 
          onLoginClick={() => setShowAuthModal(true)} 
          stats={{
            userCount: verifiedUserCount,
            voteCount: totalVotesCast,
            participationRate: verifiedUserCount > 0 ? Math.round((totalVotesCast / (verifiedUserCount * votes.length)) * 100) : 0
          }}
        />
        {showAuthModal && (
          <AuthModal 
            onClose={() => setShowAuthModal(false)}
            onLogin={handleLogin}
            onRegister={handleRegister}
          />
        )}
      </>
    );
  }

  // 2. Authenticated Dashboard View
  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Top Navigation */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => {setCurrentUser(null)}}>
             <div className="bg-indigo-600 p-1.5 rounded-lg">
                <Building className="text-white h-5 w-5" />
             </div>
             <span className="font-bold text-gray-900 text-lg hidden sm:block">华侨城智慧社区</span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-900">{currentUser.name}</p>
              <div className="flex justify-end gap-2">
                 <p className="text-xs text-gray-500">{currentUser.building} - {currentUser.unit}</p>
                 <Badge status={currentUser.role} className="text-[10px]" />
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout} title="退出登录">
              <LogOut className="h-5 w-5 text-gray-500" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentUser.role === UserRole.SUPER_ADMIN && (
          <SuperAdminDashboard 
            votes={votes} // Admin sees all votes (active & closed)
            allUsers={users}
            onCreateVote={handleCreateVote}
            onCloseVote={handleCloseVote}
            onToggleRole={handleToggleRole}
            onVerifyUser={handleVerifyUser}
            onRemoveUser={handleRemoveUser}
            onEditUser={handleEditUser}
            onImportUsers={handleImportUsers}
            onEditVote={handleEditVote}
            onToggleVisibility={handleToggleVisibility}
            onReorderVotes={handleReorderVotes}
          />
        )}
        
        {currentUser.role === UserRole.BUILDING_ADMIN && (
          <BuildingAdminDashboard 
            adminBuilding={currentUser.managedBuilding || currentUser.building}
            users={users}
            onVerifyUser={handleVerifyUser}
            onRemoveUser={handleRemoveUser}
          />
        )}

        {currentUser.role === UserRole.OWNER && (
          <OwnerDashboard 
            currentUser={currentUser}
            votes={ownerVotes}
            allUsers={users}
            onVote={handleVote}
            onChangePassword={handleChangePassword}
          />
        )}
      </main>
    </div>
  );
};

export default App;