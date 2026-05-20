'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CategoryService } from '@/services/category.service';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { UploadCloud, Loader2, Edit3 } from 'lucide-react';

import { Input, Label } from '@/components/ui/Form';
import { Button } from '@/components/ui/Button';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/Dialog';

import CategoryCard from '@/components/cards/CategoryCard';

export default function ManageCategories() {
    const queryClient = useQueryClient();

    /* =========================
       STATES
    ========================= */

    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const [editFile, setEditFile] = useState<File | null>(null);

    const [editingCategory, setEditingCategory] = useState<any | null>(null);

    /* =========================
       CREATE FORM
    ========================= */

    const {
        register,
        handleSubmit,
        reset,
    } = useForm<{ title: string }>();

    /* =========================
       EDIT FORM
    ========================= */

    const {
        register: registerEdit,
        handleSubmit: handleSubmitEdit,
        setValue: setEditValue,
    } = useForm<{ title: string }>();

    /* =========================
       FETCH CATEGORIES
    ========================= */

    const { data: catRes } = useQuery({
        queryKey: ['admin-categories'],
        queryFn: CategoryService.getAllCategories,
    });

    /* =========================
       CREATE CATEGORY
    ========================= */

    const createMutation = useMutation({
        mutationFn: (formData: FormData) =>
            CategoryService.createCategory(formData),

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['admin-categories'],
            });

            toast.success('Category created!');

            reset();
            setSelectedFile(null);
        },
    });

    /* =========================
       UPDATE CATEGORY
    ========================= */

    const updateMutation = useMutation({
        mutationFn: ({
            id,
            formData,
        }: {
            id: string;
            formData: FormData;
        }) => CategoryService.updateCategory(id, formData),

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['admin-categories'],
            });

            toast.success('Category updated!');

            setEditingCategory(null);
            setEditFile(null);
        },

        onError: (err: any) =>
            toast.error(
                err.response?.data?.error || 'Update failed'
            ),
    });

    /* =========================
       CREATE SUBMIT
    ========================= */

    const onSubmit = (data: { title: string }) => {
        const formData = new FormData();

        formData.append('title', data.title);

        if (selectedFile) {
            formData.append('image', selectedFile);
        }

        createMutation.mutate(formData);
    };

    /* =========================
       UPDATE SUBMIT
    ========================= */

    const onUpdateSubmit = (data: { title: string }) => {
        const formData = new FormData();

        formData.append('title', data.title);

        if (editFile) {
            formData.append('image', editFile);
        }

        updateMutation.mutate({
            id: editingCategory._id,
            formData,
        });
    };

    /* =========================
       OPEN EDIT MODAL
    ========================= */

    const openEditDialog = (cat: any) => {
        setEditingCategory(cat);

        setEditValue('title', cat.title);
    };

    return (
        <div className="space-y-8">

            {/* <h3>Category Management</h3> */}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* =========================
                    CREATE FORM
                ========================= */}
                <div className="bg-white p-6 border rounded border-slate-100  shadow-sm h-fit">

                    <h2 className="text-xs font-black text-slate-800 uppercase mb-6 tracking-widest">
                        Create Category
                    </h2>

                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="space-y-5"
                    >
                        <div>
                            <Label>Category Name</Label>

                            <Input
                                {...register('title', {
                                    required: true,
                                })}
                                placeholder="e.g. Italian Pizza"
                            />
                        </div>

                        <div>
                            <Label>Category Image</Label>

                            <div className="relative border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:bg-slate-50 transition cursor-pointer group">

                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) =>
                                        setSelectedFile(
                                            e.target.files?.[0] || null
                                        )
                                    }
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                />

                                <UploadCloud className="mx-auto text-slate-400 group-hover:text-indigo-500 mb-2" />

                                <p className="text-[10px] font-bold text-slate-500 uppercase">
                                    {selectedFile
                                        ? selectedFile.name
                                        : 'Upload Image'}
                                </p>
                            </div>
                        </div>

                        <Button
                            className="w-full"
                            disabled={createMutation.isPending}
                        >
                            {createMutation.isPending ? (
                                <Loader2 className="animate-spin" />
                            ) : (
                                'Publish Category'
                            )}
                        </Button>
                    </form>
                </div>

                {/* =========================
                    CATEGORY LIST
                ========================= */}
                <div className="lg:col-span-2 bg-white p-6 border border-slate-100 rounded shadow-sm">

                    <div className="flex justify-between items-center mb-6">

                        <h2 className="text-xs font-black text-slate-800 uppercase tracking-widest">
                            Live Categories
                        </h2>

                        <span className="bg-indigo-50 text-indigo-600 text-[10px] font-black px-2 py-1 rounded-md">
                            {catRes?.data?.length || 0} TOTAL
                        </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">

                        {catRes?.data?.map((cat: any) => (
                            <div
                                key={cat._id}
                                className="relative group"
                            >
                                <CategoryCard
                                    cat={cat}
                                    onDelete={(id) =>
                                        CategoryService
                                            .deleteCategory(id)
                                            .then(() =>
                                                queryClient.invalidateQueries({
                                                    queryKey: ['admin-categories'],
                                                })
                                            )
                                    }
                                />

                                {/* EDIT BUTTON */}
                                <button
                                    onClick={() =>
                                        openEditDialog(cat)
                                    }
                                    className="absolute top-2 left-2 p-2 bg-white text-indigo-600 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-all border border-indigo-100"
                                >
                                    <Edit3 size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* =========================
                EDIT DIALOG
            ========================= */}
            <Dialog
                open={!!editingCategory}
                onOpenChange={(open) => {
                    if (!open) {
                        setEditingCategory(null);
                    }
                }}
            >
                <DialogContent>

                    <DialogHeader>
                        <DialogTitle>
                            {editingCategory
                                ? `Update ${editingCategory.title}`
                                : 'Update Category'}
                        </DialogTitle>
                    </DialogHeader>

                    <form
                        onSubmit={handleSubmitEdit(onUpdateSubmit)}
                        className="space-y-5 pt-5"
                    >
                        <div>
                            <Label>Category Name</Label>

                            <Input
                                {...registerEdit('title', {
                                    required: true,
                                })}
                            />
                        </div>

                        <div>
                            <Label>
                                Update Image (Optional)
                            </Label>

                            <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:bg-slate-50 transition relative cursor-pointer group">

                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) =>
                                        setEditFile(
                                            e.target.files?.[0] || null
                                        )
                                    }
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                />

                                <UploadCloud className="mx-auto text-slate-400 group-hover:text-indigo-500 mb-2" />

                                <p className="text-[10px] font-bold text-slate-500 uppercase">
                                    {editFile
                                        ? editFile.name
                                        : 'Change Category Image'}
                                </p>
                            </div>

                            {editingCategory?.image && !editFile && (
                                <p className="text-[10px] text-slate-400 mt-2 italic text-center">
                                    Current:{' '}
                                    {editingCategory.image
                                        .split('/')
                                        .pop()}
                                </p>
                            )}
                        </div>

                        <div className="flex gap-3 pt-4">

                            <Button
                                type="button"
                                variant="outline"
                                className="flex-1"
                                onClick={() =>
                                    setEditingCategory(null)
                                }
                            >
                                Cancel
                            </Button>

                            <Button
                                className="flex-1"
                                disabled={updateMutation.isPending}
                            >
                                {updateMutation.isPending ? (
                                    <Loader2 className="animate-spin" />
                                ) : (
                                    'Save Changes'
                                )}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}