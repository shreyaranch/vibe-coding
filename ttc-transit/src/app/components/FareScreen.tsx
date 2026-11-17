import { CreditCard, Plus, ArrowRight, ChevronLeft, History, DollarSign } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import type { Screen } from '../App';

interface FareScreenProps {
  onNavigate: (screen: Screen) => void;
}

export function FareScreen({ onNavigate }: FareScreenProps) {
  const balance = 25.50;
  const autoloadThreshold = 10.00;

  return (
    <div className="min-h-full bg-gray-50">
      {/* Header */}
      <div className="bg-[#DA291C] px-6 pt-12 pb-6 text-white">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => onNavigate('home')}>
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1>PRESTO Card</h1>
        </div>
      </div>

      <div className="px-6 py-6">
        {/* Balance Card */}
        <Card className="bg-gradient-to-br from-[#DA291C] to-[#b31f15] text-white p-6 mb-6 rounded-2xl border-none shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm opacity-90">Current Balance</span>
            <CreditCard className="w-5 h-5 opacity-90" />
          </div>
          <div className="mb-6">
            <div className="text-4xl mb-2">${balance.toFixed(2)}</div>
            <p className="text-sm opacity-90">PRESTO Card #1234 5678 9012</p>
          </div>
          <Button 
            className="w-full bg-white text-[#DA291C] hover:bg-gray-100 rounded-xl h-12"
            onClick={() => {}}
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Funds
          </Button>
        </Card>

        {/* Quick Top-up */}
        <div className="mb-6">
          <h3 className="mb-3">Quick Top-up</h3>
          <div className="grid grid-cols-3 gap-3">
            {[10, 20, 50].map((amount) => (
              <button
                key={amount}
                className="bg-white p-4 rounded-xl border-2 border-gray-200 hover:border-[#DA291C] hover:text-[#DA291C] transition-colors"
              >
                <DollarSign className="w-5 h-5 mx-auto mb-1" />
                <span>${amount}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Auto-load */}
        <Card className="bg-white p-4 mb-6 rounded-xl border-none shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="mb-1">Auto-load</p>
              <p className="text-sm text-gray-500">Add $20 when balance falls below ${autoloadThreshold.toFixed(2)}</p>
            </div>
            <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
              Active
            </div>
          </div>
          <Progress value={70} className="h-2" />
        </Card>

        {/* Fare Info */}
        <div className="mb-6">
          <h3 className="mb-3">Fare Information</h3>
          <Card className="bg-white p-4 mb-2 rounded-xl border-none shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="mb-1">Adult Fare</p>
                <p className="text-sm text-gray-500">PRESTO</p>
              </div>
              <span className="text-lg">$3.30</span>
            </div>
          </Card>
          <Card className="bg-white p-4 mb-2 rounded-xl border-none shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="mb-1">Senior (65+) Fare</p>
                <p className="text-sm text-gray-500">PRESTO</p>
              </div>
              <span className="text-lg">$2.30</span>
            </div>
          </Card>
          <Card className="bg-white p-4 rounded-xl border-none shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="mb-1">Student Fare</p>
                <p className="text-sm text-gray-500">Valid student ID required</p>
              </div>
              <span className="text-lg">$2.30</span>
            </div>
          </Card>
        </div>

        {/* Recent Transactions */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3>Recent Transactions</h3>
            <button className="text-sm text-[#DA291C] flex items-center gap-1">
              View All
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          
          <Card className="bg-white p-4 mb-2 rounded-xl border-none shadow-sm">
            <div className="flex items-center gap-3">
              <div className="bg-red-100 rounded-full p-2">
                <History className="w-4 h-4 text-red-600" />
              </div>
              <div className="flex-1">
                <p className="mb-1">Tap at Union Station</p>
                <p className="text-sm text-gray-500">Today, 8:45 AM</p>
              </div>
              <span className="text-red-600">-$3.30</span>
            </div>
          </Card>

          <Card className="bg-white p-4 mb-2 rounded-xl border-none shadow-sm">
            <div className="flex items-center gap-3">
              <div className="bg-red-100 rounded-full p-2">
                <History className="w-4 h-4 text-red-600" />
              </div>
              <div className="flex-1">
                <p className="mb-1">Tap at Bloor-Yonge</p>
                <p className="text-sm text-gray-500">Yesterday, 6:30 PM</p>
              </div>
              <span className="text-red-600">-$3.30</span>
            </div>
          </Card>

          <Card className="bg-white p-4 rounded-xl border-none shadow-sm">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 rounded-full p-2">
                <Plus className="w-4 h-4 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="mb-1">Auto-load top-up</p>
                <p className="text-sm text-gray-500">Nov 4, 2025</p>
              </div>
              <span className="text-green-600">+$20.00</span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
