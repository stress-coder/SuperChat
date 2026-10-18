import type { ApiMessage } from '@/apis/interfaces/apiMessage.interface';
import type { ApiResponse } from '@/apis/interfaces/apiResponse.interface';
import type { ApiInbox } from '@/apis/interfaces/inbox.interface';
import type { SendMessageData } from '@/apis/interfaces/sendMessageData.interface';
import type { SendMessagePayload } from '@/apis/interfaces/sendMessage.interface';
import apiClient from './client';

export const fetchInboxes = async (): Promise<ApiInbox[]> => {
  const { data } = await apiClient.get<ApiResponse<ApiInbox[]>>('/inboxes');
  return data.data;
};

export const fetchMessages = async (inboxId: string, limit?: number): Promise<ApiMessage[]> => {
  const { data } = await apiClient.get<ApiResponse<ApiMessage[]>>(`/messages/${inboxId}`, {
    params: limit === undefined ? undefined : { limit },
  });
  return data.data;
};

export const sendMessage = async (payload: SendMessagePayload): Promise<SendMessageData> => {
  const { data } = await apiClient.post<ApiResponse<SendMessageData>>('/messages', payload);
  return data.data;
};
