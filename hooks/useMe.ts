'use client';

import { useQuery } from '@tanstack/react-query';
import { MeService } from '@/services/me.service';

export const useMe = () => {
  return useQuery({
    queryKey: ['me'],
    queryFn: MeService.getMe,
  });
};