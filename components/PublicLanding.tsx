import React from 'react';
import { VoteItem } from '../types';
import { Button, Card, Badge, ProgressBar } from './ui';
import { Calendar, Users, ArrowRight, Building } from 'lucide-react';

interface PublicLandingProps {
  votes: VoteItem[];
  onLoginClick: () => void;
  stats: {
    userCount: number;
    voteCount: number;
    participationRate: number;
  };
}

export const PublicLanding: React.FC<PublicLandingProps> = ({ votes, onLoginClick, stats }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 flex flex-col items-center text-center">
          <div className="bg-indigo-100 p-4 rounded-2xl mb-6">
            <Building className="h-12 w-12 text-indigo-600" />
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
            华侨城智慧社区
          </h1>
          <p className="mt-4 max-w-2xl text-xl text-gray-500">
            公开、透明、高效的社区自治。业主身份核验后即可参与小区事务决策。
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Button size="lg" onClick={onLoginClick}>
              登录 / 注册
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => document.getElementById('vote-list')?.scrollIntoView({ behavior: 'smooth' })}>
              查看热门议题
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-indigo-800">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 text-center">
            <div>
              <p className="text-4xl font-extrabold text-white">{votes.length}</p>
              <p className="mt-1 text-base font-medium text-indigo-200">当前议题</p>
            </div>
            <div>
              <p className="text-4xl font-extrabold text-white">{stats.userCount}</p>
              <p className="mt-1 text-base font-medium text-indigo-200">已认证住户</p>
            </div>
            <div>
              <p className="text-4xl font-extrabold text-white">{stats.participationRate}%</p>
              <p className="mt-1 text-base font-medium text-indigo-200">参与率</p>
            </div>
          </div>
        </div>
      </div>

      {/* Vote List Section */}
      <div id="vote-list" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">社区热门议题</h2>
            <p className="mt-2 text-gray-500">请登录后行使您的投票权利</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {votes.map(vote => (
            <Card key={vote.id} className="flex flex-col transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <div className="p-6 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <Badge status={vote.status} />
                  <span className="flex items-center text-xs text-gray-500">
                    <Users className="h-3 w-3 mr-1" />
                    {vote.totalVotes} 人已投
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1" title={vote.title}>
                  {vote.title}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-2 mb-4 h-10">
                  {vote.description}
                </p>
                
                {/* Visual Options Preview */}
                <div className="space-y-3 mt-4">
                  {vote.options.slice(0, 2).map((opt) => (
                    <div key={opt.id} className="text-sm">
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-700 font-medium truncate w-3/4">{opt.label}</span>
                        <span className="text-gray-500">
                           {vote.totalVotes > 0 ? Math.round((opt.count / vote.totalVotes) * 100) : 0}%
                        </span>
                      </div>
                      <ProgressBar value={opt.count} max={vote.totalVotes || 1} />
                    </div>
                  ))}
                  {vote.options.length > 2 && (
                    <p className="text-xs text-center text-gray-400 mt-2">+ 更多选项</p>
                  )}
                </div>
              </div>
              
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-between items-center">
                 <div className="flex items-center text-xs text-gray-500">
                    <Calendar className="h-3 w-3 mr-1" />
                    截止: {new Date(vote.deadline).toLocaleDateString('zh-CN')}
                 </div>
                 <Button variant="ghost" size="sm" onClick={onLoginClick} className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50">
                   参与投票
                 </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
           <p className="text-gray-400">© 2025 华侨城智慧社区系统. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};