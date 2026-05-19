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

import {
  Input,
  Label,
  Select,
  Textarea,
} from '@/components/ui/Form';

import { UploadCloud } from 'lucide-react';

import DataTable from '@/components/ui/DataTable';
import { Button } from '@/components/ui/Button';
import { ListButton } from '@/components/ui/ListButton';

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
  const [imagePreview, setImagePreview] =
    useState<string | null>(null);

  /* =========================
     FORMS
  ========================= */

  const {
    register: createRegister,
    handleSubmit: createSubmit,
    reset: createReset,
  } = useForm();

  const {
    register,
    handleSubmit,
    setValue,
  } = useForm();

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

  const { data: foodRes, isLoading } = useQuery({
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
    const newParams = new URLSearchParams(
      searchParams.toString()
    );

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

      queryClient.invalidateQueries({
        queryKey: ['foods'],
      });

      createReset();

      setImageFile(null);
      setImagePreview(null);
    },

    onError: () => {
      toast.error('Failed to create food');
    },
  });

  const handleCreate = (data: any) => {
    const formData = new FormData();

    Object.entries(data).forEach(([k, v]) =>
      formData.append(k, String(v))
    );

    if (imageFile) {
      formData.append('image', imageFile);
    }

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

      queryClient.invalidateQueries({
        queryKey: ['foods'],
      });

      setEditModal(false);

      setImageFile(null);
      setImagePreview(null);
    },

    onError: () => {
      toast.error('Failed to update food');
    },
  });

  const handleUpdate = (data: any) => {
    const formData = new FormData();

    Object.entries(data).forEach(([k, v]) =>
      formData.append(k, String(v))
    );

    if (imageFile) {
      formData.append('image', imageFile);
    }

    updateMutation.mutate({
      id: selectedFood._id,
      formData,
    });
  };

  /* =========================
     DELETE FOOD
  ========================= */

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      FoodService.deleteFood(id),

    onSuccess: () => {
      toast.success('Food deleted successfully');

      queryClient.invalidateQueries({
        queryKey: ['foods'],
      });
    },

    onError: () => {
      toast.error('Failed to delete food');
    },
  });

  const handleDelete = (id: string) => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this food?'
    );

    if (!confirmDelete) return;

    deleteMutation.mutate(id);
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
          className="w-14 h-14 object-cover rounded-lg"
        />
      ),
    },

    {
      header: 'Title',
      accessorKey: 'title',
    },

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

    {
      header: 'Delete',
      accessorKey: 'delete',

      cell: (item: any) => (
        <button
          onClick={() => handleDelete(item._id)}
          disabled={deleteMutation.isPending}
          className="bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1 rounded-md disabled:opacity-50"
        >
          {deleteMutation.isPending
            ? 'Deleting...'
            : 'Delete'}
        </button>
      ),
    },
  ];

  /* =========================
     UI
  ========================= */

  return (
    <div className="space-y-8">
      <h3 className="text-xl font-bold">
        Food Management
      </h3>

      <div className="grid grid-cols-12 gap-6">

        {/* =========================
           LEFT CREATE PANEL
        ========================= */}

        <div className="col-span-12 lg:col-span-4 rounded bg-white p-5 border border-slate-100">

          <h2 className="text-sm font-black uppercase mb-4">
            Add Food
          </h2>

          <form
            onSubmit={createSubmit(handleCreate)}
            className="space-y-4 text-sm"
          >

            {/* TITLE */}
            <div>
              <Label>Title</Label>

              <Input
                {...createRegister('title', {
                  required: true,
                })}
              />
            </div>

            {/* DESCRIPTION */}
            <div>
              <Label>Description</Label>

              <Textarea
                {...createRegister('description', {
                  required: true,
                })}
              />
            </div>

            {/* PRICE + CATEGORY */}
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
                <option value="">
                  Category
                </option>

                {categoryRes?.data?.map((c: any) => (
                  <option
                    key={c._id}
                    value={c._id}
                  >
                    {c.title}
                  </option>
                ))}
              </select>
            </div>

            {/* IMAGE */}
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

        {/* =========================
           RIGHT SIDE
        ========================= */}

        <div className="col-span-12 lg:col-span-8 space-y-4">

          {/* CATEGORY FILTERS */}

          <div className="w-full bg-white border-b rounded border-slate-100 overflow-x-auto no-scrollbar">

            <div className="flex items-center gap-4 px-4 py-2 min-w-max">

              <ListButton
                label="All"
                isActive={category === ''}
                onClick={() =>
                  updateURL({
                    category: '',
                    page: '1',
                  })
                }
              />

              {categoryRes?.data?.map((cat: any) => (
                <ListButton
                  key={cat._id}
                  label={cat.title}
                  isActive={category === cat._id}
                  onClick={() =>
                    updateURL({
                      category: cat._id,
                      page: '1',
                    })
                  }
                />
              ))}
            </div>
          </div>

          {/* TABLE */}

          <DataTable
            title="Food Collection"
            data={foodRes?.data || []}
            columns={columns}
            page={page}
            totalPages={
              foodRes?.pagination?.pages || 1
            }
            setPage={(p: number) =>
              updateURL({
                page: String(p),
              })
            }
            search={search}
            setSearch={(v: string) =>
              updateURL({
                search: v,
                page: '1',
              })
            }
            onEdit={handleEdit}
            loading={isLoading}
          />
        </div>

        {/* =========================
           EDIT MODAL
        ========================= */}

        <Dialog
          open={editModal}
          onOpenChange={setEditModal}
        >
          <DialogContent>

            <DialogHeader>
              <DialogTitle>
                Edit Food
              </DialogTitle>
            </DialogHeader>

            <form
              onSubmit={handleSubmit(handleUpdate)}
              className="space-y-4"
            >

              {/* TITLE */}
              <Input {...register('title')} />

              {/* DESCRIPTION */}
              <Textarea
                {...register('description')}
              />

              {/* PRICE */}
              <Input
                type="number"
                {...register('price')}
              />

              {/* CATEGORY */}
              <Select
                {...register('category')}
              >
                <option value="">
                  Select Category
                </option>

                {categoryRes?.data?.map((cat: any) => (
                  <option
                    key={cat._id}
                    value={cat._id}
                  >
                    {cat.title}
                  </option>
                ))}
              </Select>

              {/* IMAGE */}
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
                      Upload
                    </p>
                  </>
                )}
              </label>

              {/* UPDATE BUTTON */}

              <Button className="w-full bg-orange-600 py-2 rounded-lg">

                {updateMutation.isPending
                  ? 'Updating...'
                  : 'Update'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}