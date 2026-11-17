import { CreditCard, Plus, Smartphone, Wallet } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import type { Screen } from '../App';
import ttcLogo from 'figma:asset/0fb3aaf3cb15b1b2c46134f7dd8b62b9a9e3d2c5.png';

interface PaymentScreenProps {
  onNavigate: (screen: Screen) => void;
}

export function PaymentScreen({ onNavigate }: PaymentScreenProps) {
  return (
    <div className="min-h-full bg-gray-50">
      {/* Header with TTC Logo */}
      <div className="bg-white px-6 pt-12 pb-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <img src={ttcLogo} alt="TTC" className="h-8 w-auto" />
        </div>
        <h1 className="text-[#1B1E23]">Payment Methods</h1>
      </div>

      <div className="px-6 py-6">
        {/* Payment Methods */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[#1B1E23]">Saved Payment Methods</h3>
            <Button 
              variant="ghost"
              className="text-[#DA291C] hover:text-[#b31f15] hover:bg-red-50 h-8 px-3"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
          </div>

          <div className="space-y-3">
            {/* Stripe */}
            <Card className="bg-white p-4 rounded-xl border-2 border-[#DA291C] shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#635BFF] rounded-lg flex items-center justify-center">
                    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="white">
                      <path d="M13.479 9.883c-1.626-.604-2.512-1.067-2.512-1.803 0-.622.511-.974 1.423-.974 1.667 0 3.379.642 4.558 1.22l.666-4.111c-.935-.446-2.847-1.177-5.49-1.177-1.87 0-3.425.489-4.536 1.401-1.155.954-1.757 2.334-1.757 4 0 3.023 1.847 4.312 4.847 5.403 1.936.688 2.579 1.178 2.579 1.934 0 .732-.629 1.155-1.762 1.155-1.403 0-3.716-.689-5.231-1.578l-.674 4.157c1.304.732 3.705 1.488 6.197 1.488 1.976 0 3.624-.467 4.735-1.356 1.245-.977 1.89-2.422 1.89-4.289 0-3.091-1.889-4.38-4.935-5.472h.002z"/>
                    </svg>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-[#1B1E23]">Stripe</p>
                      <Badge className="bg-[#DA291C] text-white hover:bg-[#DA291C] text-xs">
                        Default
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500">Digital payment</p>
                  </div>
                </div>
                <button className="text-[#DA291C] text-sm">Edit</button>
              </div>
            </Card>

            {/* Credit Card */}
            <Card className="bg-white p-4 rounded-xl border-none shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-gray-700 to-gray-900 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-[#1B1E23]">Visa •••• 4242</p>
                    <p className="text-sm text-gray-500">Expires 12/26</p>
                  </div>
                </div>
                <button className="text-[#DA291C] text-sm">Edit</button>
              </div>
            </Card>

            {/* Mastercard */}
            <Card className="bg-white p-4 rounded-xl border-none shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-[#1B1E23]">Mastercard •••• 8888</p>
                    <p className="text-sm text-gray-500">Expires 08/27</p>
                  </div>
                </div>
                <button className="text-[#DA291C] text-sm">Edit</button>
              </div>
            </Card>

            {/* Apple Pay */}
            <Card className="bg-white p-4 rounded-xl border-none shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center">
                    <Smartphone className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-[#1B1E23]">Apple Pay</p>
                    <p className="text-sm text-gray-500">Digital wallet</p>
                  </div>
                </div>
                <button className="text-[#DA291C] text-sm">Edit</button>
              </div>
            </Card>

            {/* Google Pay */}
            <Card className="bg-white p-4 rounded-xl border-none shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white border-2 border-gray-200 rounded-lg flex items-center justify-center">
                    <Wallet className="w-6 h-6 text-gray-700" />
                  </div>
                  <div>
                    <p className="text-[#1B1E23]">Google Pay</p>
                    <p className="text-sm text-gray-500">Digital wallet</p>
                  </div>
                </div>
                <button className="text-[#DA291C] text-sm">Edit</button>
              </div>
            </Card>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="mb-6">
          <h3 className="text-[#1B1E23] mb-4">Recent Transactions</h3>

          <div className="space-y-2">
            <Card className="bg-white p-4 rounded-xl border-none shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#1B1E23] mb-1">Union Station</p>
                  <p className="text-sm text-gray-500">Today, 8:45 AM</p>
                </div>
                <div className="text-right">
                  <p className="text-[#DA291C]">-$3.35</p>
                  <Badge className="bg-gray-100 text-gray-600 hover:bg-gray-100 text-xs mt-1">
                    Subway
                  </Badge>
                </div>
              </div>
            </Card>

            <Card className="bg-white p-4 rounded-xl border-none shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#1B1E23] mb-1">King Station</p>
                  <p className="text-sm text-gray-500">Yesterday, 6:30 PM</p>
                </div>
                <div className="text-right">
                  <p className="text-[#DA291C]">-$3.35</p>
                  <Badge className="bg-gray-100 text-gray-600 hover:bg-gray-100 text-xs mt-1">
                    Streetcar
                  </Badge>
                </div>
              </div>
            </Card>

            <Card className="bg-white p-4 rounded-xl border-none shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#1B1E23] mb-1">Bus Route 29</p>
                  <p className="text-sm text-gray-500">Nov 19, 2025</p>
                </div>
                <div className="text-right">
                  <p className="text-[#DA291C]">-$3.35</p>
                  <Badge className="bg-gray-100 text-gray-600 hover:bg-gray-100 text-xs mt-1">
                    Bus
                  </Badge>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Fare Info */}
        <Card className="bg-blue-50 border border-blue-200 p-4 rounded-xl mb-24">
          <h3 className="text-[#1B1E23] mb-2 text-sm">Fare Information</h3>
          <div className="space-y-1 text-sm text-gray-700">
            <p>• Adult: $3.35 per trip</p>
            <p>• Senior (65+) & Student: $2.30</p>
            <p>• Pay seamlessly with your preferred method</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
