import React, { useState, useRef } from 'react';
import { VoteItem, VoteOption, VoteCreationRequest, User, UserRole, UserStatus } from '../types';
import { generateVoteDetails } from '../services/geminiService';
import { Button, Input, Card, Badge } from './ui';
import { Plus, Wand2, X, UserCog, Shield, ShieldAlert, Building2, Check, Trash2, Pencil, Eye, EyeOff, GripVertical, Download, Upload } from 'lucide-react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface SuperAdminDashboardProps {
  votes: VoteItem[];
  allUsers: User[];
  onCreateVote: (vote: VoteItem) => void;
  onCloseVote: (id: string) => void;
  onToggleRole: (userId: string, newRole: UserRole, managedBuilding?: string) => void;
  onVerifyUser: (userId: string, isApproved: boolean) => void;
  onRemoveUser: (userId: string) => void;
  onEditUser: (userId: string, updates: Partial<User>) => void;
  onImportUsers: (users: Partial<User>[]) => void;
  onEditVote: (id: string, updates: Partial<VoteItem>) => void;
  onToggleVisibility: (id: string) => void;
  onReorderVotes: (newOrder: VoteItem[]) => void;
}

export const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({ 
  votes, 
  allUsers,
  onCreateVote, 
  onCloseVote,
  onToggleRole,
  onVerifyUser,
  onRemoveUser,
  onEditUser,
  onImportUsers,
  onEditVote,
  onToggleVisibility,
  onReorderVotes
}) => {
  const [activeTab, setActiveTab] = useState<'votes' | 'users' | 'audit'>('votes');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Vote Creation State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [topic, setTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedData, setGeneratedData] = useState<{title: string, description: string, options: string[]} | null>(null);

  // Vote Editing State
  const [editingVote, setEditingVote] = useState<VoteItem | null>(null);
  const [editForm, setEditForm] = useState({ title: '', description: '', deadline: '' });

  // User Editing State
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userEditForm, setUserEditForm] = useState({ name: '', phoneNumber: '', building: '', unit: '' });

  // Role Management State
  const [promoteModalUser, setPromoteModalUser] = useState<User | null>(null);
  const [targetBuilding, setTargetBuilding] = useState('');

  // Drag and Drop State
  const [draggedVoteIndex, setDraggedVoteIndex] = useState<number | null>(null);

  // --- Logic for Orphaned Users ---
  // 1. Find all active managed buildings
  const activeManagedBuildings = new Set(
    allUsers
      .filter(u => u.role === UserRole.BUILDING_ADMIN && u.managedBuilding)
      .map(u => u.managedBuilding)
  );

  // 2. Find pending users whose building is NOT in the active set
  const orphanedPendingUsers = allUsers.filter(u => 
    u.status === UserStatus.PENDING && 
    u.role === UserRole.OWNER &&
    (!activeManagedBuildings.has(u.building))
  );

  // --- Handlers ---

  const handleGenerate = async () => {
    if (!topic) return;
    setIsGenerating(true);
    try {
      const result = await generateVoteDetails(topic);
      setGeneratedData(result);
    } catch (e) {
      console.error(e);
      alert("生成失败，请重试。");
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePublish = () => {
    if (!generatedData) return;
    
    // Calculate new order (smallest order - 1 to put at top)
    const minOrder = votes.length > 0 ? Math.min(...votes.map(v => v.order || 0)) : 0;

    const newVote: VoteItem = {
      id: Date.now().toString(),
      title: generatedData.title,
      description: generatedData.description,
      createdAt: new Date().toISOString(),
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active',
      totalVotes: 0,
      votedUserIds: [],
      options: generatedData.options.map((opt, idx) => ({
        id: `opt-${idx}`,
        label: opt,
        count: 0
      })),
      isVisible: true,
      order: minOrder - 1
    };

    onCreateVote(newVote);
    setIsModalOpen(false);
    setTopic('');
    setGeneratedData(null);
  };

  const handleOpenEdit = (vote: VoteItem) => {
    setEditingVote(vote);
    setEditForm({
      title: vote.title,
      description: vote.description,
      deadline: vote.deadline ? new Date(vote.deadline).toISOString().split('T')[0] : ''
    });
  };

  const handleSaveEdit = () => {
    if (!editingVote) return;
    onEditVote(editingVote.id, {
      title: editForm.title,
      description: editForm.description,
      deadline: new Date(editForm.deadline).toISOString()
    });
    setEditingVote(null);
  };

  const handleOpenEditUser = (user: User) => {
    setEditingUser(user);
    setUserEditForm({
      name: user.name,
      phoneNumber: user.phoneNumber,
      building: user.building,
      unit: user.unit
    });
  };

  const handleSaveUserEdit = () => {
    if (!editingUser) return;
    onEditUser(editingUser.id, {
      name: userEditForm.name,
      phoneNumber: userEditForm.phoneNumber,
      building: userEditForm.building,
      unit: userEditForm.unit
    });
    setEditingUser(null);
  };

  const openPromoteModal = (user: User) => {
    setPromoteModalUser(user);
    setTargetBuilding(user.building); // Default to their own building
  };

  const confirmPromotion = () => {
    if (promoteModalUser && targetBuilding) {
      onToggleRole(promoteModalUser.id, UserRole.BUILDING_ADMIN, targetBuilding);
      setPromoteModalUser(null);
      setTargetBuilding('');
    }
  };

  // --- Import / Export Handlers ---
  const handleExport = () => {
    // Filter out Super Admin from export
    const usersToExport = allUsers.filter(u => u.role !== UserRole.SUPER_ADMIN);
    const dataStr = JSON.stringify(usersToExport, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `community_users_export_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (Array.isArray(json)) {
          onImportUsers(json);
          alert(`成功导入 ${json.length} 条用户数据`);
        } else {
          alert('文件格式错误：必须是用户数组 JSON');
        }
      } catch (err) {
        console.error(err);
        alert('文件解析失败，请确保是有效的 JSON 文件');
      }
    };
    reader.readAsText(file);
    // Reset input
    e.target.value = '';
  };

  // --- Drag and Drop Handlers ---
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedVoteIndex(index);
    e.dataTransfer.effectAllowed = "move";
    // Optional: set custom drag image
  };

  const handleDragEnter = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedVoteIndex === null || draggedVoteIndex === index) return;

    const newVotes = [...votes];
    const draggedItem = newVotes[draggedVoteIndex];
    newVotes.splice(draggedVoteIndex, 1);
    newVotes.splice(index, 0, draggedItem);

    // Update orders based on new positions
    const updatedOrderVotes = newVotes.map((v, i) => ({ ...v, order: i }));
    
    setDraggedVoteIndex(index);
    onReorderVotes(updatedOrderVotes);
  };

  const handleDragEnd = () => {
    setDraggedVoteIndex(null);
  };

  const handleDeleteClick = (e: React.MouseEvent, user: User) => {
    e.stopPropagation();
    if (window.confirm(`确定要删除用户 "${user.name}" 吗？此操作不可恢复。`)) {
      onRemoveUser(user.id);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">系统管理后台</h2>
          <p className="text-gray-500">管理投票议题及小区人员权限。</p>
        </div>
        <div className="flex bg-white rounded-lg p-1 shadow-sm border border-gray-200">
           <button 
             onClick={() => setActiveTab('votes')}
             className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'votes' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}
           >
             投票管理
           </button>
           <button 
             onClick={() => setActiveTab('users')}
             className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'users' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}
           >
             人员权限
           </button>
           <button 
             onClick={() => setActiveTab('audit')}
             className={`px-4 py-2 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${activeTab === 'audit' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}
           >
             <span>系统直管审核</span>
             {orphanedPendingUsers.length > 0 && (
               <span className="bg-red-500 text-white text-[10px] px-1.5 rounded-full">{orphanedPendingUsers.length}</span>
             )}
           </button>
        </div>
      </div>

      {activeTab === 'votes' && (
        <>
          <div className="flex justify-end">
             <Button onClick={() => setIsModalOpen(true)}>
               <Plus className="mr-2 h-4 w-4" />
               发起新投票
             </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {votes.map((vote, index) => (
              <Card 
                key={vote.id} 
                className={`flex flex-col h-full transition-all duration-200 ${vote.isVisible === false ? 'opacity-75 border-dashed bg-gray-50' : ''} ${draggedVoteIndex === index ? 'opacity-50 ring-2 ring-indigo-500 scale-95' : ''}`}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragEnter={(e) => handleDragEnter(e, index)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => e.preventDefault()}
              >
                <div className="p-6 flex-1 relative group">
                  <div className="absolute top-2 right-2 p-1 text-gray-300 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity" title="拖拽排序">
                     <GripVertical className="w-5 h-5" />
                  </div>
                  <div className="flex justify-between items-start mb-4 pr-6">
                    <Badge status={vote.status} />
                    <div className="flex items-center gap-2">
                       {vote.isVisible === false && (
                         <span className="text-xs text-gray-400 flex items-center bg-gray-100 px-2 py-0.5 rounded-full">
                           <EyeOff className="w-3 h-3 mr-1" /> 已隐藏
                         </span>
                       )}
                       <span className="text-xs text-gray-500">总票数: {vote.totalVotes}</span>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{vote.title}</h3>
                  <p className="text-sm text-gray-600 line-clamp-3 mb-4">{vote.description}</p>
                  
                  {/* Added min-w-0 to prevent width calculation issues in Recharts */}
                  <div className="h-32 w-full mt-4 min-w-0">
                     <ResponsiveContainer width="100%" height="100%">
                       <BarChart data={vote.options}>
                         <XAxis dataKey="label" hide />
                         <Tooltip 
                           contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                           cursor={{fill: 'transparent'}}
                         />
                         <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]}>
                            {vote.options.map((entry, index) => (
                               <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#6366f1' : '#818cf8'} />
                            ))}
                         </Bar>
                       </BarChart>
                     </ResponsiveContainer>
                  </div>
                </div>
                <div className="bg-white px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-2">
                   <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => onToggleVisibility(vote.id)} title={vote.isVisible !== false ? "隐藏" : "显示"}>
                         {vote.isVisible !== false ? <Eye className="w-4 h-4 text-gray-500" /> : <EyeOff className="w-4 h-4 text-gray-400" />}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(vote)} title="编辑">
                         <Pencil className="w-4 h-4 text-gray-500" />
                      </Button>
                   </div>
                   {vote.status === 'active' ? (
                     <Button variant="outline" size="sm" onClick={() => onCloseVote(vote.id)}>截止</Button>
                   ) : (
                     <Button variant="ghost" size="sm" disabled>已归档</Button>
                   )}
                </div>
              </Card>
            ))}
          </div>
        </>
      )}

      {activeTab === 'users' && (
        <Card className="p-6">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <div className="flex items-center gap-2 text-indigo-800 bg-indigo-50 p-3 rounded-lg flex-1 w-full sm:w-auto">
               <UserCog className="h-5 w-5" />
               <span className="text-sm font-medium">指定楼栋管家：您可以将任意“业主”提升为“楼栋管家”，并指定其负责管理的楼栋。</span>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <input type="file" accept=".json" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
              <Button variant="outline" size="sm" onClick={handleImportClick}>
                <Upload className="w-4 h-4 mr-2" />
                导入业主
              </Button>
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="w-4 h-4 mr-2" />
                导出数据
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">姓名</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">居住信息</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">手机号</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">角色 / 管理范围</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {allUsers.filter(u => u.role !== UserRole.SUPER_ADMIN).map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.building} - {user.unit}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.phoneNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <Badge status={user.role} />
                        {user.role === UserRole.BUILDING_ADMIN && user.managedBuilding && (
                          <span className="text-xs text-indigo-600 font-medium">
                            管理: {user.managedBuilding}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleOpenEditUser(user)} title="编辑信息">
                          <Pencil className="w-4 h-4 text-gray-500" />
                        </Button>
                        <Button 
                          type="button"
                          variant="ghost" 
                          size="sm" 
                          className="text-red-500 hover:text-red-700 hover:bg-red-50" 
                          onClick={(e) => handleDeleteClick(e, user)}
                          title="删除用户"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        {user.role === UserRole.BUILDING_ADMIN ? (
                           <Button size="sm" variant="outline" onClick={() => onToggleRole(user.id, UserRole.OWNER)}>
                              <ShieldAlert className="w-3 h-3 mr-1" />
                              撤销管家
                           </Button>
                        ) : (
                           <Button size="sm" variant="secondary" onClick={() => openPromoteModal(user)}>
                              <Shield className="w-3 h-3 mr-1" />
                              设为管家
                           </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {activeTab === 'audit' && (
        <div className="space-y-6">
           <div className="bg-orange-50 border border-orange-100 p-4 rounded-lg">
              <h3 className="text-orange-800 font-semibold flex items-center gap-2">
                <ShieldAlert className="h-5 w-5" />
                系统直管说明
              </h3>
              <p className="text-orange-700 text-sm mt-1">
                以下用户所居住的楼栋目前<strong>没有指派楼栋管家</strong>。作为超级管理员，您需要直接审核这些用户的身份，或将其删除。
              </p>
           </div>

           {orphanedPendingUsers.length === 0 ? (
             <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
               <Check className="mx-auto h-12 w-12 text-green-400" />
               <p className="mt-2 text-gray-500">当前没有需要直管审核的用户。</p>
             </div>
           ) : (
             <div className="grid gap-4">
               {orphanedPendingUsers.map(user => (
                 <Card key={user.id} className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-orange-200">
                   <div className="flex items-center gap-4">
                     <div className="bg-gray-100 p-3 rounded-full">
                       <UserCog className="h-6 w-6 text-gray-600" />
                     </div>
                     <div>
                       <div className="flex items-center gap-2">
                         <h4 className="text-lg font-medium text-gray-900">{user.name}</h4>
                         <span className="bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded">无管家覆盖</span>
                       </div>
                       <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                         <Building2 className="h-4 w-4" />
                         <span className="font-medium text-gray-700">{user.building}</span>
                         <span>- {user.unit}室</span>
                         <span className="text-gray-300">|</span>
                         <span>{user.phoneNumber}</span>
                       </div>
                     </div>
                   </div>
                   <div className="flex gap-2 w-full md:w-auto">
                      <Button variant="outline" className="flex-1 md:flex-none border-red-200 text-red-700 hover:bg-red-50" onClick={() => {
                        if(window.confirm('确定要删除此用户申请吗？')) onRemoveUser(user.id);
                      }}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        删除申请
                      </Button>
                      <Button className="flex-1 md:flex-none bg-indigo-600 hover:bg-indigo-700" onClick={() => onVerifyUser(user.id, true)}>
                        <Check className="mr-2 h-4 w-4" />
                        系统通过
                      </Button>
                   </div>
                 </Card>
               ))}
             </div>
           )}
        </div>
      )}

      {/* CREATE VOTE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">创建新投票</h3>
                <button onClick={() => setIsModalOpen(false)}><X className="h-5 w-5 text-gray-400 hover:text-gray-600" /></button>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">议题主题</label>
                  <div className="flex gap-2">
                    <input 
                      value={topic} 
                      onChange={(e) => setTopic(e.target.value)} 
                      placeholder="例如：维修大堂天花板" 
                      className="flex-1 rounded-md border border-gray-300 p-2 text-sm focus:ring-2 focus:ring-indigo-500"
                    />
                    <Button onClick={handleGenerate} disabled={!topic || isGenerating}>
                      <Wand2 className="mr-2 h-4 w-4" />
                      {isGenerating ? 'AI 生成中...' : 'AI 智能生成'}
                    </Button>
                  </div>
                </div>

                {generatedData && (
                  <div className="mt-6 space-y-4 bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                    <h4 className="font-bold text-gray-900">{generatedData.title}</h4>
                    <p className="text-sm text-gray-700">{generatedData.description}</p>
                    <ul className="space-y-1">
                        {generatedData.options.map((opt, i) => (
                          <li key={i} className="text-sm text-gray-700 flex items-center">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mr-2"></span>
                            {opt}
                          </li>
                        ))}
                    </ul>
                  </div>
                )}
                
                <div className="pt-4 flex justify-end gap-3">
                  <Button variant="ghost" onClick={() => setIsModalOpen(false)}>取消</Button>
                  <Button onClick={handlePublish} disabled={!generatedData}>发布投票</Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* EDIT VOTE MODAL */}
      {editingVote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
             <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold">修改投票内容</h3>
                  <button onClick={() => setEditingVote(null)}><X className="h-5 w-5 text-gray-400 hover:text-gray-600" /></button>
                </div>
                
                <div className="space-y-4">
                   <Input 
                      label="标题" 
                      value={editForm.title} 
                      onChange={(e) => setEditForm({...editForm, title: e.target.value})} 
                   />
                   <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">描述</label>
                      <textarea 
                        className="w-full rounded-md border border-gray-300 p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                        rows={4}
                        value={editForm.description}
                        onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                      />
                   </div>
                   <Input 
                      label="截止日期" 
                      type="date"
                      value={editForm.deadline} 
                      onChange={(e) => setEditForm({...editForm, deadline: e.target.value})} 
                   />
                </div>

                <div className="pt-6 flex justify-end gap-3">
                   <Button variant="ghost" onClick={() => setEditingVote(null)}>取消</Button>
                   <Button onClick={handleSaveEdit}>保存修改</Button>
                </div>
             </div>
          </Card>
        </div>
      )}

      {/* EDIT USER MODAL */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
             <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold">编辑用户信息</h3>
                  <button onClick={() => setEditingUser(null)}><X className="h-5 w-5 text-gray-400 hover:text-gray-600" /></button>
                </div>
                
                <div className="space-y-4">
                   <Input 
                      label="姓名" 
                      value={userEditForm.name} 
                      onChange={(e) => setUserEditForm({...userEditForm, name: e.target.value})} 
                   />
                   <div className="grid grid-cols-2 gap-4">
                      <Input 
                        label="楼栋" 
                        value={userEditForm.building} 
                        onChange={(e) => setUserEditForm({...userEditForm, building: e.target.value})} 
                      />
                      <Input 
                        label="单元号" 
                        value={userEditForm.unit} 
                        onChange={(e) => setUserEditForm({...userEditForm, unit: e.target.value})} 
                      />
                   </div>
                   <Input 
                      label="手机号码" 
                      value={userEditForm.phoneNumber} 
                      onChange={(e) => setUserEditForm({...userEditForm, phoneNumber: e.target.value})} 
                   />
                </div>

                <div className="pt-6 flex justify-end gap-3">
                   <Button variant="ghost" onClick={() => setEditingUser(null)}>取消</Button>
                   <Button onClick={handleSaveUserEdit}>保存修改</Button>
                </div>
             </div>
          </Card>
        </div>
      )}

      {/* PROMOTE USER MODAL */}
      {promoteModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-sm p-6">
            <h3 className="text-lg font-bold mb-4">设置楼栋管家</h3>
            <p className="text-sm text-gray-500 mb-4">
              您正在将 <strong>{promoteModalUser.name}</strong> 设为楼栋管家。请指定该管家负责审核哪一栋楼的住户。
            </p>
            <Input 
              label="负责楼栋" 
              value={targetBuilding} 
              onChange={(e) => setTargetBuilding(e.target.value)}
              placeholder="例如：A栋"
            />
            <div className="flex justify-end gap-2 mt-4">
               <Button variant="ghost" onClick={() => setPromoteModalUser(null)}>取消</Button>
               <Button onClick={confirmPromotion}>确认任命</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};