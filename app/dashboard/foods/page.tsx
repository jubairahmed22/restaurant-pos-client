'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';
import { Trash2, Plus, UploadCloud, UtensilsCrossed } from 'lucide-react';
import { Input, Label, Select, Textarea } from '@/components/ui/Form';
import DataTable from '@/components/ui/DataTable';

export default function ManageFoodsAdmin() {
    const token = useAuthStore((state) => state.token);
    const queryClient = useQueryClient();
    const [imageFile, setImageFile] = useState<File | null>(null);

    const { register, handleSubmit, reset } = useForm();

    // Load standard items and categories
    const { data: foodRes } = useQuery({
        queryKey: ['admin-foods-list'],
        queryFn: async () => (await axios.get('http://localhost:51000/api/v1/foods')).data
    });

    const { data: categoryRes } = useQuery({
        queryKey: ['admin-categories-list'],
        queryFn: async () => (await axios.get('http://localhost:51000/api/v1/categories')).data
    });

    // Food deletion pipeline
    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            await axios.delete(`http://localhost:51000/api/v1/foods/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-foods-list'] });
            toast.success("Food item removed successfully");
        }
    });

    // Food creation pipeline
    const createMutation = useMutation({
        mutationFn: async (formData: FormData) => {
            return await axios.post('http://localhost:51000/api/v1/foods', formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-foods-list'] });
            toast.success("New item added to menu!");
            reset();
            setImageFile(null);
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.error || "Error adding food item");
        }
    });

    const handleFormSubmit = (data: any) => {
        if (!data.category) {
            toast.error("Please assign a valid category parent structural trace link.");
            return;
        }
        const formData = new FormData();
        formData.append('title', data.title);
        formData.append('description', data.description);
        formData.append('price', data.price);
        formData.append('category', data.category);
        if (imageFile) {
            formData.append('image', imageFile);
        }
        createMutation.mutate(formData);
    };

    const foodColumns = [
    {
        header: "Image",
        accessorKey: "image",
        cell: (item: FoodItem) => (
            <img
                src={item.image}
                alt={item.title}
                className="w-12 h-12 rounded-lg object-cover border border-slate-200"
            />
        ),
    },
    {
        header: "Food Name",
        accessorKey: "title",
        cell: (item: FoodItem) => (
            <span className="font-semibold text-slate-700">
                {item.title}
            </span>
        ),
    },
    {
        header: "Price",
        accessorKey: "price",
        cell: (item: FoodItem) => (
            <span className="font-bold text-orange-500">
                ${item.price.toFixed(2)}
            </span>
        ),
    },
];
    return (
        <div className="space-y-10">
            <div>
                <h3>Manage Menu Catalog</h3>
                <p >Add new dishes or remove expired configurations from the user marketplace.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* Creation Form Panel */}
                <div className="bg-white p-6  border border-slate-100 space-y-4">
                    <h2 className="font-bold text-lg flex items-center gap-2"><Plus size={18} className="text-orange-500" /><span>Add New Item</span></h2>
                    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 text-sm">
                        <div>
                            <Label>Item Name</Label>
                            <Input type="text" {...register('title', { required: true })} placeholder="e.g. Pepperoni Pizza" />
                        </div>
                        <div>
                            <Label>Description</Label>
                            <Textarea {...register('description', { required: true })} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 focus:outline-none text-white h-20" placeholder="Describe the ingredients and preparation..." />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Base Price ($)</Label>
                                <Input type="number" step="0.01" {...register('price', { required: true })} placeholder="12.99" />
                            </div>
                            <div>
                                <Label>Category</Label>
                                <Select {...register('category', { required: true })} >
                                    <option value="">Select...</option>
                                    {categoryRes?.data?.map((cat: any) => (
                                        <option key={cat._id} value={cat._id}>{cat.title}</option>
                                    ))}
                                </Select>
                            </div>
                        </div>

                        <div>
                            <Label>Product Display Image</Label>

                            <label className="relative border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:bg-slate-50 transition cursor-pointer group block">

                                <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                                    className="hidden"
                                />

                                <UploadCloud className="mx-auto text-slate-400 group-hover:text-indigo-500 mb-2" />

                                <p className="text-[10px] font-bold text-slate-500 uppercase truncate">
                                    {imageFile ? imageFile.name : "Upload Image"}
                                </p>
                            </label>
                        </div>

                        <button type="submit" disabled={createMutation.isPending} className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-slate-800 text-white font-bold py-2.5 rounded-xl transition mt-2">
                            {createMutation.isPending ? "Adding Item..." : "Publish Item"}
                        </button>
                    </form>
                </div>

                <div className="lg:col-span-2">
  <DataTable<FoodItem>
    title="Active Digital Menu Items"
    data={foodRes?.data || []}
    columns={foodColumns}
    onDelete={(item) => {
      if (confirm("Are you sure?")) {
        deleteMutation.mutate(item._id);
      }
    }}
    isActionLoading={deleteMutation.isPending}
  />
</div>
            </div>
        </div>
    );
}