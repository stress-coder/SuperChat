import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import Button from '@/components/ui/Button';
import TextField from '@/components/ui/TextField';
import { newChatSchema } from '@/validations/newChat.validation';
import type { NewChatFormValues } from '@/validations/newChat.validation';

interface NewChatFormProps {
  onSubmit: (values: NewChatFormValues) => Promise<boolean>;
  onDone: () => void;
}

const NewChatForm = ({ onSubmit, onDone }: NewChatFormProps) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<NewChatFormValues>({
    resolver: zodResolver(newChatSchema),
    defaultValues: { recipientId: '', content: '' },
  });

  const submit = async (values: NewChatFormValues) => {
    if (await onSubmit(values)) {
      reset();
      onDone();
    }
  };

  return (
    <form className="new-chat" onSubmit={(event) => void handleSubmit(submit)(event)}>
      <TextField
        id="new-chat-recipient"
        label="User ID"
        autoComplete="off"
        placeholder="e.g. 3f2b…-…"
        error={errors.recipientId?.message}
        registration={register('recipientId')}
      />

      <TextField
        id="new-chat-content"
        label="First message"
        autoComplete="off"
        placeholder="Say hello"
        error={errors.content?.message}
        registration={register('content')}
      />

      <Button type="submit" fullWidth isLoading={isSubmitting}>
        Start chat
      </Button>
    </form>
  );
};

export default NewChatForm;
