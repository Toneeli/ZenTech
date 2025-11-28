import React, { useState } from 'react';
import { User, VoteItem, UserStatus } from '../types';
import { Button, Card, Badge, Input, ProgressBar } from './ui';
import { Check, Clock, Home, User as UserIcon, Lock, X, ChevronDown, ChevronUp } from 'lucide-react';

interface OwnerDashboardProps {
  currentUser: User;
  votes: VoteItem[];
  allUsers: User[]; // To show voter details
  onVote: (voteId: string, optionId: string) => void;
  onChangePassword: (newPass: string) => void;
}

export const OwnerDashboard: React.FC<OwnerDashboardProps> = ({ 
  currentUser, 
  votes, 
  allUsers,
  onVote,
  onChangePassword 
}) => {
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [expandedVoteId, setExpandedVoteId] = useState<string | null>(null);

  const handleChangePassword = () => {
    if (newPassword.length < 6) {
      alert("密码长度至少6位");
      return;
    }
    onChangePassword(newPassword);
    setNewPassword('');
    setIsPassModalOpen(false);
    alert("密码修改成功");
  };

  const toggleExpanded = (voteId: string) => {
    setExpandedVoteId(prev => prev === voteId ? null : voteId);
  };

  // Show profile info regardless of status
  const ProfileHeader = () => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8 flex flex-col sm:flex-row items-center sm:justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
          <UserIcon className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900">{currentUser.name}</h2>
          <div className="flex items-center text-sm text-gray-500 gap-2">
            <Home className="h-4 w-4" />
            <span>{currentUser.building} - {currentUser.unit}室</span>
            <span className="mx-2 text-gray-300">|</span>
            <span>{currentUser.phoneNumber}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={() => setIsPassModalOpen(true)}>
          <Lock className="w-3 h-3 mr-1" />
          修改密码
        </Button>
        <Badge status={currentUser.status} className="text-sm px-3 py-1" />
      </div>
    </div>
  );

  if (currentUser.status !== UserStatus.VERIFIED) {
    return (
      <div className="space-y-6">
        <ProfileHeader />
        <div className="flex flex-col items-center justify-center min-h-[40vh] text-center p-6 bg-white rounded-xl border border-gray-200">
          <div className="bg-yellow-100 p-6 rounded-full mb-6">
            <Clock className="h-12 w-12 text-yellow-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">身份审核中</h2>
          <p className="text-gray-600 max-w-md">
            您的账户正在由 <strong>{currentUser.building}</strong> 的楼栋管家进行审核。
            <br/>确认您的房产信息无误后，您将获得投票权限。
          </p>
        </div>
      </div>
    );
  }

  // Only show active votes
  const activeVotes = votes.filter(v => v.status === 'active');

  return (
    <div className="space-y-8">
      <ProfileHeader />
      
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          正在进行的投票
          <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">{activeVotes.length}</span>
        </h2>
        
        <div className="grid gap-6">
          {activeVotes.length === 0 ? (
            <div className="text-center py-10 bg-gray-50 rounded-xl">
              <p className="text-gray-500">当前没有正在进行的投票。</p>
            </div>
          ) : (
            activeVotes.map(vote => {
              const hasVoted = vote.votedUserIds.includes(currentUser.id);
              const isExpanded = expandedVoteId === vote.id;
              
              // Get users who voted for this item (only if hasVoted)
              const votedUsersList = hasVoted ? allUsers.filter(u => vote.votedUserIds.includes(u.id)) : [];

              return (
                <Card key={vote.id} className="p-6 border-l-4 border-l-indigo-500">
                  <div className="mb-4">
                    <div className="flex justify-between items-start">
                      <h3 className="text-xl font-bold text-gray-900">{vote.title}</h3>
                      {hasVoted && <Badge status="VOTED" />}
                    </div>
                    <p className="text-gray-600 mt-2">{vote.description}</p>
                    <p className="text-xs text-gray-400 mt-2">截止日期: {new Date(vote.deadline).toLocaleDateString('zh-CN')}</p>
                  </div>

                  {hasVoted ? (
                     <div className="space-y-4">
                       <div className="bg-green-50 p-4 rounded-lg flex items-center text-green-800 border border-green-100">
                          <Check className="h-5 w-5 mr-2" />
                          感谢您的参与！
                       </div>
                       
                       {/* Results Preview */}
                       <div className="space-y-3">
                          <h4 className="text-sm font-semibold text-gray-700">当前投票结果</h4>
                          {vote.options.map((opt) => (
                            <div key={opt.id} className="text-sm">
                              <div className="flex justify-between mb-1">
                                <span className="text-gray-700">{opt.label}</span>
                                <span className="text-gray-500">
                                   {vote.totalVotes > 0 ? Math.round((opt.count / vote.totalVotes) * 100) : 0}% 
                                   ({opt.count}票)
                                </span>
                              </div>
                              <ProgressBar value={opt.count} max={vote.totalVotes || 1} />
                            </div>
                          ))}
                       </div>

                       {/* Voter Publicity Toggle */}
                       <div className="border-t border-gray-100 pt-3">
                         <button 
                           onClick={() => toggleExpanded(vote.id)}
                           className="flex items-center text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                         >
                           {isExpanded ? <ChevronUp className="h-4 w-4 mr-1" /> : <ChevronDown className="h-4 w-4 mr-1" />}
                           {isExpanded ? '收起已投票业主公示' : '查看已投票业主公示'}
                         </button>
                         
                         {isExpanded && (
                           <div className="mt-4 bg-gray-50 rounded-lg p-4 max-h-60 overflow-y-auto">
                              <h5 className="text-xs font-bold text-gray-500 uppercase mb-3">已参与投票业主 ({votedUsersList.length})</h5>
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {votedUsersList.map(u => (
                                  <div key={u.id} className="text-xs bg-white border border-gray-200 p-2 rounded flex flex-col">
                                     <span className="font-bold text-gray-800">{u.name}</span>
                                     <span className="text-gray-500">{u.building} {u.unit}</span>
                                  </div>
                                ))}
                              </div>
                           </div>
                         )}
                       </div>
                     </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
                      {vote.options.map(option => (
                        <button
                          key={option.id}
                          onClick={() => onVote(vote.id, option.id)}
                          className="relative flex items-center justify-center p-4 rounded-lg border border-gray-200 hover:border-indigo-500 hover:bg-indigo-50 transition-all group text-left"
                        >
                          <span className="font-medium text-gray-700 group-hover:text-indigo-700">{option.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </Card>
              );
            })
          )}
        </div>
      </div>

      {/* Change Password Modal */}
      {isPassModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-sm p-6 relative">
            <button 
              onClick={() => setIsPassModalOpen(false)} 
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-lg font-bold mb-4">修改密码</h3>
            <Input 
               label="新密码" 
               type="password" 
               value={newPassword} 
               onChange={(e) => setNewPassword(e.target.value)} 
               placeholder="至少6位字符"
            />
            <div className="mt-4 flex justify-end">
               <Button onClick={handleChangePassword}>确认修改</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};