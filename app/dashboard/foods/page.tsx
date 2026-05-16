'use client';

import React, { useState } from 'react';
import {
    useMutation,
    useQuery,
    useQueryClient,
} from '@tanstack/react-query';

import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useRouter, useSearchParams } from 'next/navigation';

import { FoodService } from '@/services/food.service';
import { CategoryService } from '@/services/category.service';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/Dialog';

import { Input, Label, Textarea } from '@/components/ui/Form';
import { UploadCloud } from 'lucide-react';
import DataTable from '@/components/ui/DataTable';
import { Button } from '@/components/ui/Button';

/* =========================
   PAGE
========================= */

export default function FoodTablePage() {
    const queryClient = useQueryClient();
    const router = useRouter();
    const searchParams = useSearchParams();

    /* =========================
       URL STATE
    ========================= */

    const page = Number(searchParams.get('page') || 1);
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';

    /* =========================
       LOCAL STATE
    ========================= */

    const [editModal, setEditModal] = useState(false);
    const [selectedFood, setSelectedFood] = useState<any>(null);

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    /* =========================
       FORMS
    ========================= */

    const {
        register: createRegister,
        handleSubmit: createSubmit,
        reset: createReset,
    } = useForm();

    const { register, handleSubmit, setValue } = useForm();

    /* =========================
       QUERY PARAMS
    ========================= */

    const queryParams = new URLSearchParams({
        page: String(page),
        limit: '9',
        search,
        category,
    }).toString();

    /* =========================
       DATA
    ========================= */

    const { data: foodRes } = useQuery({
        queryKey: ['foods', queryParams],
        queryFn: () => FoodService.getAllFoods(queryParams),
    });

    const { data: categoryRes } = useQuery({
        queryKey: ['categories'],
        queryFn: CategoryService.getAllCategories,
    });

    /* =========================
       URL UPDATE HELPER
    ========================= */

    const updateURL = (params: Record<string, string>) => {
        const newParams = new URLSearchParams(searchParams.toString());

        Object.entries(params).forEach(([key, value]) => {
            if (value) newParams.set(key, value);
            else newParams.delete(key);
        });

        router.push(`?${newParams.toString()}`);
    };

    /* =========================
       IMAGE PREVIEW
    ========================= */

    const handleImageChange = (file: File | null) => {
        setImageFile(file);

        if (file) {
            setImagePreview(URL.createObjectURL(file));
        } else {
            setImagePreview(null);
        }
    };

    /* =========================
       CREATE FOOD
    ========================= */

    const createMutation = useMutation({
        mutationFn: (formData: FormData) =>
            FoodService.createFood(formData),

        onSuccess: () => {
            toast.success('Food created successfully');
            queryClient.invalidateQueries({ queryKey: ['foods'] });
            createReset();
            setImageFile(null);
            setImagePreview(null);
        },
    });

    const handleCreate = (data: any) => {
        const formData = new FormData();

        Object.entries(data).forEach(([k, v]) =>
            formData.append(k, String(v))
        );

        if (imageFile) formData.append('image', imageFile);

        createMutation.mutate(formData);
    };

    /* =========================
       EDIT HANDLER
    ========================= */

    const handleEdit = (food: any) => {
        setSelectedFood(food);

        setValue('title', food.title);
        setValue('description', food.description);
        setValue('price', food.price);
        setValue('category', food.category?._id);

        setImagePreview(food.image);

        setEditModal(true);
    };

    /* =========================
       UPDATE FOOD
    ========================= */

    const updateMutation = useMutation({
        mutationFn: ({ id, formData }: any) =>
            FoodService.updateFood(id, formData),

        onSuccess: () => {
            toast.success('Food updated successfully');
            queryClient.invalidateQueries({ queryKey: ['foods'] });
            setEditModal(false);
        },
    });

    const handleUpdate = (data: any) => {
        const formData = new FormData();

        Object.entries(data).forEach(([k, v]) =>
            formData.append(k, String(v))
        );

        if (imageFile) formData.append('image', imageFile);

        updateMutation.mutate({
            id: selectedFood._id,
            formData,
        });
    };

    /* =========================
       TABLE COLUMNS
    ========================= */

    const columns = [
        {
            header: 'Image',
            accessorKey: 'image',
            cell: (item: any) => (
                <img
                    src={item.image}
                    className="w-14 h-14  object-cover"
                />
            ),
        },
        { header: 'Title', accessorKey: 'title' },
        {
            header: 'Category',
            accessorKey: 'category',
            cell: (item: any) => item.category?.title,
        },
        {
            header: 'Price',
            accessorKey: 'price',
            cell: (item: any) => `$${item.price}`,
        },
    ];

    /* =========================
       UI
    ========================= */

    return (
        <div className="space-y-8">
            <h3 >Food Management</h3>

            <div className="grid grid-cols-12 gap-6">

                {/* =========================
          LEFT CREATE PANEL (FULL RESTORED)
      ========================= */}
                <div className="col-span-12 lg:col-span-4 bg-white p-5  border border-slate-100">

                    <h2 className="text-sm font-black uppercase mb-4">
                        Add Food
                    </h2>

                    <form
                        onSubmit={createSubmit(handleCreate)}
                        className="space-y-4 text-sm"
                    >
                        <div>
                            <Label>Title</Label>
                            <Input {...createRegister('title', { required: true })} />
                        </div>

                        <div>
                            <Label>Description</Label>
                            <Textarea
                                {...createRegister('description', { required: true })}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <Input
                                type="number"
                                placeholder="Price"
                                {...createRegister('price')}
                            />

                            <select
                                className="border border-slate-100 rounded-lg px-2"
                                {...createRegister('category')}
                            >
                                <option value="">Category</option>
                                {categoryRes?.data?.map((c: any) => (
                                    <option key={c._id} value={c._id}>
                                        {c.title}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* IMAGE UPLOADER */}
                        <label className="block border border-slate-100 p-3 rounded-lg text-center cursor-pointer">
                            <input
                                type="file"
                                hidden
                                onChange={(e) =>
                                    handleImageChange(
                                        e.target.files?.[0] || null
                                    )
                                }
                            />

                            {imagePreview ? (
                                <img
                                    src={imagePreview}
                                    className="w-full h-32 object-cover rounded-lg"
                                />
                            ) : (
                                <>
                                    <UploadCloud className="mx-auto" />
                                    <p className="text-xs">
                                        Upload Image
                                    </p>
                                </>
                            )}
                        </label>

                        <Button>
                            {createMutation.isPending
                                ? 'Saving...'
                                : 'Create'}
                        </Button>
                    </form>
                </div>
asdfas
                {/* =========================
          RIGHT SIDE
      ========================= */}
                <div className="col-span-12 lg:col-span-8 space-y-4">

                    {/* CATEGORY FILTERS */}
                    <div className="flex flex-wrap gap-2 bg-white p-3  border border-slate-100">

                        <Button
                            onClick={() => updateURL({ category: '', page: '1' })}
                            className={`px-3 py-1.5 rounded-full border border-slate-100 text-sm ${category === '' ? 'bg-black text-white' : ''
                                }`}
                        >
                            All
                        </Button>

                        {categoryRes?.data?.map((cat: any) => (
                            <Button
                                key={cat._id}
                                onClick={() =>
                                    updateURL({
                                        category: cat._id,
                                        page: '1',
                                    })
                                }
                                className={`px-3 py-1.5 rounded-full border border-slate-100 text-sm ${category === cat._id
                                    ? 'bg-orange-600 text-white'
                                    : ''
                                    }`}
                            >
                                {cat.title}
                            </Button>
                        ))}
                    </div>

                    {/* TABLE */}
                    <DataTable
                        title="Food Collection"
                        data={foodRes?.data || []}
                        columns={columns}
                        page={page}
                        totalPages={foodRes?.pagination?.pages || 1}
                        setPage={(p: number) =>
                            updateURL({ page: String(p) })
                        }
                        search={search}
                        setSearch={(v: string) =>
                            updateURL({ search: v, page: '1' })
                        }
                        onEdit={handleEdit}
                    />
                </div>

                {/* =========================
          EDIT MODAL
      ========================= */}
                {/* =========================
    EDIT MODAL
========================= */}
                <Dialog open={editModal} onOpenChange={setEditModal}>
                    <DialogContent className="bg-slate-900 text-white max-w-xl">
                        <DialogHeader>
                            <DialogTitle>Edit Food</DialogTitle>
                        </DialogHeader>

                        <form
                            onSubmit={handleSubmit(handleUpdate)}
                            className="space-y-4"
                        >
                            {/* TITLE */}
                            <Input {...register('title')} />

                            {/* DESCRIPTION */}
                            <Textarea {...register('description')} />

                            {/* PRICE */}
                            <Input {...register('price')} />

                            {/* CATEGORY (ADDED) */}
                            <select
                                className="w-full border border-slate-100 border border-slate-100-slate-700 bg-slate-800 text-white rounded-lg px-3 py-2 text-sm focus:outline-none"
                                {...register('category')}
                            >
                                <option value="">Select Category</option>
                                {categoryRes?.data?.map((cat: any) => (
                                    <option key={cat._id} value={cat._id}>
                                        {cat.title}
                                    </option>
                                ))}
                            </select>

                            {/* IMAGE UPLOADER */}
                            <label className="block border border-slate-100 p-3 rounded-lg text-center cursor-pointer">
                                <input
                                    type="file"
                                    hidden
                                    onChange={(e) =>
                                        handleImageChange(e.target.files?.[0] || null)
                                    }
                                />

                                {imagePreview ? (
                                    <img
                                        src={imagePreview}
                                        className="w-full h-32 object-cover rounded-lg"
                                    />
                                ) : (
                                    <>
                                        <UploadCloud className="mx-auto" />
                                        <p className="text-xs">Upload</p>
                                    </>
                                )}
                            </label>

                            {/* SUBMIT */}
                            <Button className="w-full bg-orange-600 py-2 rounded-lg">
                                Update
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}