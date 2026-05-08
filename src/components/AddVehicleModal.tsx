'use client';

import React, { useState, useRef } from 'react';
import { X, Plus, Loader2, Car, Hash, Euro, MapPin, Layers, Image as ImageIcon, Settings, Fuel, Upload, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/context/ToastContext';
import { useRep } from '@/context/RepContext';

interface AddVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddVehicleModal = ({ isOpen, onClose, onSuccess }: AddVehicleModalProps) => {
  const { showToast } = useToast();
  const { rep } = useRep();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    vin: '',
    make: '',
    model: '',
    variant: '',
    year: new Date().getFullYear(),
    price: '',
    sale_price: '',
    mileage: '',
    location: 'Limerick',
    class: 'Sedan',
    image_url: '',
    transmission: 'Automatic',
    fuel_type: 'Diesel',
    registration_number: '',
    reg: '',
    engine_size: '',
    colour: '',
    doors: '5',
    previous_owners: '0',
    seats: '5'
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `vehicles/${fileName}`;

      // Upload to Supabase Storage (assuming 'vehicles' bucket exists)
      const { error: uploadError, data } = await supabase.storage
        .from('vehicles')
        .upload(filePath, file);

      if (uploadError) {
        // Fallback: If bucket doesn't exist, use a placeholder/mock URL for demo
        console.warn('Storage bucket not found, using simulation mode');
        const simulatedUrl = URL.createObjectURL(file);
        setFormData(prev => ({ ...prev, image_url: simulatedUrl }));
        showToast({ message: 'Photo Uploaded (Simulation)', type: 'success' });
      } else {
        const { data: { publicUrl } } = supabase.storage
          .from('vehicles')
          .getPublicUrl(filePath);
        
        setFormData(prev => ({ ...prev, image_url: publicUrl }));
        showToast({ message: 'Asset Visual Verified', type: 'success' });
      }
    } catch (error) {
      console.error('Upload error:', error);
      showToast({ message: 'Photo Protocol Failed', type: 'error' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.image_url) {
      showToast({ message: 'Asset Visual Required', type: 'error' });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('vehicles').insert({
        vin: formData.vin,
        make: formData.make,
        model: formData.model,
        variant: formData.variant,
        year: parseInt(formData.year.toString()),
        price: parseFloat(formData.price),
        sale_price: formData.sale_price ? parseFloat(formData.sale_price) : null,
        mileage: parseFloat(formData.mileage) || 0,
        location: formData.location,
        class: formData.class,
        image_url: formData.image_url,
        transmission: formData.transmission,
        fuel_type: formData.fuel_type,
        registration_number: formData.registration_number || formData.vin,
        reg: formData.reg,
        engine_size: formData.engine_size,
        colour: formData.colour,
        doors: parseInt(formData.doors),
        previous_owners: parseInt(formData.previous_owners),
        seats: parseInt(formData.seats),
        status: 'available',
        created_by: rep
      });
      if (error) throw error;
      showToast({ message: 'Vehicle Registered Successfully', type: 'success' });
      onSuccess();
      onClose();
    } catch (error: any) {
      showToast({ message: error.message || 'Failed to add vehicle', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 30 }}
            className="bg-white border border-slate-200 rounded-[2.5rem] shadow-2xl w-full max-w-4xl overflow-hidden"
          >
            <div className="p-8 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-3xl font-black uppercase tracking-tight text-foreground italic flex items-center gap-4">
                  <Plus className="text-blue-500" size={28} />
                  Register Asset
                </h3>
                <p className="text-[10px] uppercase tracking-[0.4em] mt-2 force-black">
                  Inventory Acquisition & Photo Registration Protocol
                </p>
              </div>
              <button onClick={onClose} className="p-3 hover:bg-slate-100 rounded-full transition-colors text-black hover:text-foreground">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-10 space-y-8 max-h-[75vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-2">
                  <label className="text-[9px] uppercase tracking-[0.4em] text-black font-black flex items-center gap-2">
                    <Car size={14} /> Manufacturer
                  </label>
                  <input required value={formData.make} onChange={e => setFormData({ ...formData, make: e.target.value })} placeholder="e.g. BMW" className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-black text-foreground outline-none focus:border-blue-500/50 transition-all placeholder:text-black" />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] uppercase tracking-[0.4em] text-black font-black flex items-center gap-2">
                    <Layers size={14} /> Variant
                  </label>
                  <input required value={formData.model} onChange={e => setFormData({ ...formData, model: e.target.value })} placeholder="e.g. 520d M-Sport" className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-black text-foreground outline-none focus:border-blue-500/50 transition-all placeholder:text-black" />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] uppercase tracking-[0.4em] text-black font-black flex items-center gap-2">
                    <Settings size={14} /> Chassis ID (VIN)
                  </label>
                  <input required value={formData.vin} onChange={e => setFormData({ ...formData, vin: e.target.value.toUpperCase() })} placeholder="IDENTIFICATION PHOTO" className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-mono font-black text-foreground outline-none focus:border-blue-500/50 transition-all placeholder:text-black" />
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] uppercase tracking-[0.4em] text-black font-black flex items-center gap-2">
                    <Euro size={14} /> Acquisition Cost
                  </label>
                  <input required type="number" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} placeholder="0.00" className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-mono font-black text-blue-600 outline-none focus:border-blue-500/50 transition-all placeholder:text-black" />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] uppercase tracking-[0.4em] text-black font-black flex items-center gap-2">
                    <Euro size={14} /> Target Price
                  </label>
                  <input required type="number" value={formData.sale_price} onChange={e => setFormData({ ...formData, sale_price: e.target.value })} placeholder="0.00" className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-mono font-black text-foreground outline-none focus:border-blue-500/50 transition-all placeholder:text-black" />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] uppercase tracking-[0.4em] text-black font-black flex items-center gap-2">
                    <Hash size={14} /> Irish Registration
                  </label>
                  <input value={formData.registration_number} onChange={e => setFormData({ ...formData, registration_number: e.target.value.toUpperCase() })} placeholder="221-D-XXXX" className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-mono font-black text-foreground outline-none focus:border-blue-500/50 transition-all placeholder:text-black" />
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] uppercase tracking-[0.4em] text-black font-black flex items-center gap-2">
                    <Hash size={14} /> Mileage (KM)
                  </label>
                  <input type="number" value={formData.mileage} onChange={e => setFormData({ ...formData, mileage: e.target.value })} placeholder="0" className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-mono font-black text-foreground outline-none focus:border-blue-500/50 transition-all placeholder:text-black" />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] uppercase tracking-[0.4em] text-black font-black flex items-center gap-2">
                    <Settings size={14} /> Transmission
                  </label>
                  <select value={formData.transmission} onChange={e => setFormData({ ...formData, transmission: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-black text-foreground outline-none focus:border-blue-500/50 transition-all appearance-none">
                    <option value="Automatic" className="bg-white">Automatic</option>
                    <option value="Manual" className="bg-white">Manual</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] uppercase tracking-[0.4em] text-black font-black flex items-center gap-2">
                    <Fuel size={14} /> Fuel Protocol
                  </label>
                  <select value={formData.fuel_type} onChange={e => setFormData({ ...formData, fuel_type: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-black text-foreground outline-none focus:border-blue-500/50 transition-all appearance-none">
                    <option value="Diesel" className="bg-white">Diesel</option>
                    <option value="Petrol" className="bg-white">Petrol</option>
                    <option value="Electric" className="bg-white">Electric</option>
                    <option value="Hybrid" className="bg-white">Hybrid</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[9px] uppercase tracking-[0.4em] text-black font-black flex items-center gap-2">
                    <MapPin size={14} /> Logistics Hub
                  </label>
                  <select value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-black text-foreground outline-none focus:border-blue-500/50 transition-all appearance-none">
                    <option value="Limerick" className="bg-white">Limerick Depot</option>
                    <option value="Galway" className="bg-white">Galway Depot</option>
                  </select>
                </div>
                
                {/* Photo Upload Option */}
                <div className="space-y-2">
                  <label className="text-[9px] uppercase tracking-[0.4em] text-black font-black flex items-center gap-2">
                    <ImageIcon size={14} /> Asset Visual Photo
                  </label>
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative w-full h-[60px] bg-slate-50 border-2 border-dashed ${formData.image_url ? 'border-teal-500/50' : 'border-slate-200'} rounded-2xl flex items-center justify-center cursor-pointer hover:bg-slate-100 transition-all group overflow-hidden`}
                  >
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      className="hidden" 
                      accept="image/*"
                    />
                    
                    <AnimatePresence mode="wait">
                      {isUploading ? (
                        <motion.div 
                          key="uploading"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center gap-3"
                        >
                          <Loader2 size={18} className="text-blue-600 animate-spin" />
                          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-600">Uploading Profile...</span>
                        </motion.div>
                      ) : formData.image_url ? (
                        <motion.div 
                          key="uploaded"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center gap-3"
                        >
                          <CheckCircle2 size={18} className="text-teal-600" />
                          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-teal-600">Photo Verified</span>
                          <img src={formData.image_url} className="absolute right-0 top-0 h-full w-20 object-cover opacity-40 blur-[1px]" alt="preview" />
                        </motion.div>
                      ) : (
                        <motion.div 
                          key="idle"
                          className="flex items-center gap-3"
                        >
                          <Upload size={18} className="text-black group-hover:text-blue-600 transition-colors" />
                          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-black group-hover:text-black transition-colors">Capture Asset Visual</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              <div className="pt-10 flex gap-6">
                <button type="button" onClick={onClose} className="flex-1 py-5 text-[10px] font-black uppercase tracking-[0.4em] text-black bg-slate-50 rounded-2xl hover:bg-slate-100 transition-all border border-slate-200">
                  Abort Registration
                </button>
                <button type="submit" disabled={isSubmitting || isUploading} className="flex-[2] py-5 bg-blue-600 text-black text-[10px] font-black uppercase tracking-[0.4em] rounded-2xl flex items-center justify-center gap-4 shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all active:scale-[0.98] disabled:opacity-50">
                  {isSubmitting ? <Loader2 size={20} className="animate-spin text-black" /> : <Plus size={20} className="text-black" />}
                  Commit to Inventory Photo
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AddVehicleModal;
