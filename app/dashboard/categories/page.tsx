'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CategoryService } from '@/services/category.service';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { UploadCloud, Loader2, Edit3, GripVertical, Trash2, AlertTriangle } from 'lucide-react';

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { Input, Label } from '@/components/ui/Form';
import { Button } from '@/components/ui/Button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog';
import CategoryCard from '@/components/cards/CategoryCard';

/* ── Sortable wrapper ── */
function SortableCategoryItem({
  cat,
  onEdit,
}: {
  cat: any;
  onEdit: (cat: any) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: cat._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : 'auto',
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      {/* No onDelete passed — delete moved to dialog */}
      <CategoryCard cat={cat} />

      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="absolute top-2 right-2 p-1.5 bg-white text-slate-400 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-all border border-slate-100 cursor-grab active:cursor-grabbing"
        title="Drag to reorder"
      >
        <GripVertical size={14} />
      </button>

      {/* Edit button */}
      <button
        onClick={() => onEdit(cat)}
        className="absolute top-2 left-2 p-2 bg-white text-indigo-600 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-all border border-indigo-100"
      >
        <Edit3 size={14} />
      </button>
    </div>
  );
}

/* ── Main Component ── */
export default function ManageCategories() {
  const queryClient = useQueryClient();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [editFile, setEditFile] = useState<File | null>(null);
  const [editingCategory, setEditingCategory] = useState<any | null>(null);
  const [orderedCats, setOrderedCats] = useState<any[]>([]);

  // Warning dialog state
  const [showDeleteWarning, setShowDeleteWarning] = useState(false);

  const { register, handleSubmit, reset } = useForm<{ title: string }>();
  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    setValue: setEditValue,
  } = useForm<{ title: string }>();

  const { data: catRes } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: CategoryService.getAllCategories,
  });

  useEffect(() => {
    if (catRes?.data) setOrderedCats(catRes.data);
  }, [catRes?.data]);

  /* ── DnD ── */
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const reorderMutation = useMutation({
    mutationFn: (orderedIds: string[]) =>
      CategoryService.reorderCategories(orderedIds),
    onError: () => {
      toast.error('Reorder failed, reverting...');
      if (catRes?.data) setOrderedCats(catRes.data);
    },
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setOrderedCats((prev) => {
      const oldIndex = prev.findIndex((c) => c._id === active.id);
      const newIndex = prev.findIndex((c) => c._id === over.id);
      const reordered = arrayMove(prev, oldIndex, newIndex);
      reorderMutation.mutate(reordered.map((c) => c._id));
      return reordered;
    });
  };

  /* ── Create ── */
  const createMutation = useMutation({
    mutationFn: (formData: FormData) => CategoryService.createCategory(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      toast.success('Category created!');
      reset();
      setSelectedFile(null);
    },
  });

  /* ── Update ── */
  const updateMutation = useMutation({
    mutationFn: ({ id, formData }: { id: string; formData: FormData }) =>
      CategoryService.updateCategory(id, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      toast.success('Category updated!');
      setEditingCategory(null);
      setEditFile(null);
    },
    onError: (err: any) =>
      toast.error(err.response?.data?.error || 'Update failed'),
  });

  /* ── Delete ── */
  const deleteMutation = useMutation({
    mutationFn: (id: string) => CategoryService.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      toast.success('Category deleted!');
      setShowDeleteWarning(false);
      setEditingCategory(null);
    },
    onError: () => toast.error('Delete failed'),
  });

  const onSubmit = (data: { title: string }) => {
    const formData = new FormData();
    formData.append('title', data.title);
    if (selectedFile) formData.append('image', selectedFile);
    createMutation.mutate(formData);
  };

  const onUpdateSubmit = (data: { title: string }) => {
    const formData = new FormData();
    formData.append('title', data.title);
    if (editFile) formData.append('image', editFile);
    updateMutation.mutate({ id: editingCategory._id, formData });
  };

  const openEditDialog = (cat: any) => {
    setEditingCategory(cat);
    setEditValue('title', cat.title);
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ── Create Form ── */}
        <div className="bg-white p-6 border rounded border-slate-100 shadow-sm h-fit">
          <h2 className="text-xs font-black text-slate-800 uppercase mb-6 tracking-widest">
            Create Category
          </h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <Label>Category Name</Label>
              <Input
                {...register('title', { required: true })}
                placeholder="e.g. Italian Pizza"
              />
            </div>
            <div>
              <Label>Category Image</Label>
              <div className="relative border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:bg-slate-50 transition cursor-pointer group">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <UploadCloud className="mx-auto text-slate-400 group-hover:text-indigo-500 mb-2" />
                <p className="text-[10px] font-bold text-slate-500 uppercase">
                  {selectedFile ? selectedFile.name : 'Upload Image'}
                </p>
              </div>
            </div>
            <Button className="w-full" disabled={createMutation.isPending}>
              {createMutation.isPending
                ? <Loader2 className="animate-spin" />
                : 'Publish Category'}
            </Button>
          </form>
        </div>

        {/* ── Category List ── */}
        <div className="lg:col-span-2 bg-white p-6 border border-slate-100 rounded shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xs font-black text-slate-800 uppercase tracking-widest">
                Live Categories
              </h2>
              <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                Drag <GripVertical className="inline w-3 h-3" /> to reorder
              </p>
            </div>
            <span className="bg-indigo-50 text-indigo-600 text-[10px] font-black px-2 py-1 rounded-md">
              {orderedCats.length} TOTAL
            </span>
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={orderedCats.map((c) => c._id)}
              strategy={rectSortingStrategy}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                {orderedCats.map((cat) => (
                  <SortableCategoryItem
                    key={cat._id}
                    cat={cat}
                    onEdit={openEditDialog}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      </div>

      {/* ══════════════════════════════
          EDIT DIALOG
      ══════════════════════════════ */}
      <Dialog
        open={!!editingCategory}
        onOpenChange={(open) => {
          if (!open) {
            setEditingCategory(null);
            setEditFile(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory
                ? `Update "${editingCategory.title}"`
                : 'Update Category'}
            </DialogTitle>
          </DialogHeader>

          <form
            onSubmit={handleSubmitEdit(onUpdateSubmit)}
            className="space-y-5 pt-5"
          >
            <div>
              <Label>Category Name</Label>
              <Input {...registerEdit('title', { required: true })} />
            </div>

            <div>
              <Label>Update Image (Optional)</Label>
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:bg-slate-50 transition relative cursor-pointer group">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setEditFile(e.target.files?.[0] || null)}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <UploadCloud className="mx-auto text-slate-400 group-hover:text-indigo-500 mb-2" />
                <p className="text-[10px] font-bold text-slate-500 uppercase">
                  {editFile ? editFile.name : 'Change Category Image'}
                </p>
              </div>
              {editingCategory?.image && !editFile && (
                <p className="text-[10px] text-slate-400 mt-2 italic text-center">
                  Current: {editingCategory.image.split('/').pop()}
                </p>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setEditingCategory(null);
                  setEditFile(null);
                }}
              >
                Cancel
              </Button>

              <Button className="flex-1" disabled={updateMutation.isPending}>
                {updateMutation.isPending
                  ? <Loader2 className="animate-spin" />
                  : 'Save Changes'}
              </Button>
            </div>

            {/* ── Delete section ── */}
            <div className="border-t border-slate-100 pt-4">
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-3">
                Danger Zone
              </p>
              <button
                type="button"
                onClick={() => setShowDeleteWarning(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-red-200 text-red-500 text-sm font-semibold hover:bg-red-50 transition-colors"
              >
                <Trash2 size={15} />
                Delete This Category
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ══════════════════════════════
          DELETE WARNING DIALOG
      ══════════════════════════════ */}
      <Dialog
        open={showDeleteWarning}
        onOpenChange={(open) => {
          if (!open) setShowDeleteWarning(false);
        }}
      >
        <DialogContent className="max-w-sm">
          <div className="flex flex-col items-center text-center gap-4 py-2">

            {/* Warning icon */}
            <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
              <AlertTriangle className="text-red-500 w-7 h-7" />
            </div>

            <div>
              <h3 className="text-base font-black text-slate-800">
                Delete Category?
              </h3>
              <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
                You're about to permanently delete{' '}
                <span className="font-bold text-slate-700">
                  "{editingCategory?.title}"
                </span>
                . This action{' '}
                <span className="text-red-500 font-semibold">cannot be undone</span>
                . All associated data will be lost.
              </p>
            </div>

            <div className="flex gap-3 w-full pt-1">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setShowDeleteWarning(false)}
              >
                Cancel
              </Button>

              <button
                type="button"
                disabled={deleteMutation.isPending}
                onClick={() => deleteMutation.mutate(editingCategory?._id)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-bold transition-colors disabled:opacity-60"
              >
                {deleteMutation.isPending
                  ? <Loader2 size={15} className="animate-spin" />
                  : <><Trash2 size={15} /> Yes, Delete</>}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}