'use client';

import React, { useState } from 'react';
import { MoreVertical, ChevronDown } from 'lucide-react';
import Image from 'next/image';

const inventoryData = [
  {
    id: 1,
    make: 'ASTON MARTIN',
    model: 'DB12',
    status: 'Available',
    class: 'Hypercar',
    vin: 'VIN 20ST907G12',
    mileage: '900',
    location: 'USA',
    price: '$265,000',
    image: 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?q=80&w=300&auto=format&fit=crop',
    statusColor: 'text-green-400 border-green-400/30',
  },
  {
    id: 2,
    make: 'PORSCHE',
    model: '911 GT3',
    status: 'In Transit',
    class: 'Coupe',
    vin: 'VIN 20S4S07V13',
    mileage: '900',
    location: 'USA',
    price: '$198,500',
    image: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?q=80&w=300&auto=format&fit=crop',
    statusColor: 'text-amber-400 border-amber-400/30',
  },
  {
    id: 3,
    make: 'FERRARI',
    model: 'F8',
    status: 'Reserved',
    class: 'Hypercar',
    vin: 'VIN 20S1S07145',
    mileage: '900',
    location: 'USA',
    price: '$198,500',
    image: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?q=80&w=300&auto=format&fit=crop',
    statusColor: 'text-white border-white/30',
  },
  {
    id: 4,
    make: 'LAMBORGHINI',
    model: 'REVUELTO',
    status: 'Sold',
    class: 'Hypercar',
    vin: 'VIN 2067S00213',
    mileage: '900',
    location: 'USA',
    price: '$125,000',
    image: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?q=80&w=300&auto=format&fit=crop',
    statusColor: 'text-rose-400 border-rose-400/30',
  },
  {
    id: 5,
    make: 'BENTLEY',
    model: 'BENTAYGA',
    status: 'Sold',
    class: 'SUV',
    vin: 'VIN 20S7B07412',
    mileage: '500',
    location: 'USA',
    price: '$175,000',
    image: 'https://images.unsplash.com/photo-1621136531940-0e1a14a79901?q=80&w=300&auto=format&fit=crop',
    statusColor: 'text-rose-400 border-rose-400/30',
  },
];

const classes = ['All class', 'Sedan', 'SUV', 'Coupe', 'Hypercar'];

const InventoryList = () => {
  const [selectedClass, setSelectedClass] = useState('All class');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const filteredData = selectedClass === 'All class' 
    ? inventoryData 
    : inventoryData.filter(item => item.class === selectedClass);

  return (
    <div className="bg-navy-card border border-navy-border rounded-xl p-5 relative overflow-hidden flex flex-col h-full">
      <div className="absolute inset-0 bg-navy-card-gradient opacity-50 pointer-events-none rounded-xl" />
      
      <div className="relative z-20 flex items-center justify-between mb-4">
        <h3 className="text-xs tracking-widest text-gray-300 uppercase">Real-Time Inventory Overview</h3>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 border border-gray-700 rounded-md px-3 py-1 bg-black/20 hover:border-white/50 transition-colors"
            >
              <span className="text-xs text-gray-400">{selectedClass}</span>
              <ChevronDown size={14} className={`text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isDropdownOpen && (
              <div className="absolute top-full right-0 mt-1 w-32 bg-navy-card border border-navy-border rounded-md shadow-xl z-30">
                {classes.map((cls) => (
                  <button
                    key={cls}
                    onClick={() => {
                      setSelectedClass(cls);
                      setIsDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    {cls}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button 
            onClick={() => alert('Options menu clicked')}
            className="text-gray-500 hover:text-navy-accent"
          >
            <MoreVertical size={16} />
          </button>
        </div>
      </div>

      <div className="relative z-10 flex-1 overflow-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-800 text-[10px] text-gray-500 uppercase tracking-widest">
              <th className="pb-3 font-medium">Vehicle</th>
              <th className="pb-3 font-medium">Status</th>
              <th className="pb-3 font-medium">VIN</th>
              <th className="pb-3 font-medium">Mileage</th>
              <th className="pb-3 font-medium">Location</th>
              <th className="pb-3 font-medium text-right">Price</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/50">
            {filteredData.map((item) => (
              <tr key={item.id} className="group hover:bg-white/[0.02] transition-colors">
                <td className="py-3">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-10 rounded-md overflow-hidden relative border border-gray-800 bg-navy-card/50 flex items-center justify-center">
                      {/* Using standard img for reliability with external domains */}
                      <img 
                        src={item.image} 
                        alt={item.model}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=200&auto=format&fit=crop'; // Final fallback
                        }}
                      />
                    </div>
                    <div>
                      <p className="text-xs text-white font-medium">{item.make}</p>
                      <p className="text-[10px] text-gray-400">{item.model}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3">
                  <span className={`text-[10px] px-2 py-1 rounded-full border ${item.statusColor} bg-black/20`}>
                    {item.status}
                  </span>
                </td>
                <td className="py-3 text-xs text-gray-400">{item.vin}</td>
                <td className="py-3 text-xs text-gray-400">{item.mileage}</td>
                <td className="py-3 text-xs text-gray-400">{item.location}</td>
                <td className="py-3 text-xs text-white text-right">{item.price}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredData.length === 0 && (
          <div className="text-center py-10">
            <p className="text-xs text-gray-500 uppercase tracking-widest">No vehicles found in this class</p>
          </div>
        )}
      </div>
      
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-[1px] bg-navy-gradient opacity-50" />
    </div>
  );
};

export default InventoryList;

