import React, { useRef, useEffect } from 'react';
import { View, FlatList, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../ui/Typography';
import { Avatar } from '../ui/Avatar';
import { palette, semanticColors } from '../../constants/colors';
import { spacing, radius } from '../../constants/spacing';
import { ChatMessage } from '../../types';
import { formatMessageTime } from '../../utils/dateUtils';
import { useChatStore } from '../../store/chatStore';
import { useAuthStore } from '../../store/authStore';

interface ChatThreadProps {
  threadId: string;
}

export function ChatThread({ threadId }: ChatThreadProps) {
  const { getMessages, sendMessage } = useChatStore();
  const { user } = useAuthStore();
  const messages = getMessages(threadId);
  const [input, setInput] = React.useState('');
  const flatRef = useRef<FlatList>(null);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages.length]);

  const handleSend = () => {
    if (!input.trim() || !user) return;
    sendMessage(threadId, user.id, user.displayName.split(' ')[0], input.trim());
    setInput('');
  };

  const renderMessage = ({ item: msg }: { item: ChatMessage }) => {
    if (msg.type === 'system') {
      return (
        <View style={styles.systemMsg}>
          <Ionicons name="information-circle-outline" size={14} color={palette.textSecondary} />
          <Typography variant="caption" color={palette.textSecondary} align="center">
            {msg.content}
          </Typography>
        </View>
      );
    }

    const isOwn = msg.senderId === user?.id;
    return (
      <View style={[styles.messageRow, isOwn && styles.messageRowOwn]}>
        {!isOwn && (
          <Avatar name={msg.senderName} size={28} />
        )}
        <View style={[styles.bubble, isOwn ? styles.bubbleOwn : styles.bubbleOther]}>
          {!isOwn && (
            <Typography style={{ fontSize: 10, fontWeight: '700', color: semanticColors.primary, marginBottom: 2 }}>
              {msg.senderName}
            </Typography>
          )}
          <Typography style={{ fontSize: 14, color: isOwn ? palette.white : palette.textPrimary, lineHeight: 20 }}>
            {msg.content}
          </Typography>
          <Typography style={{ fontSize: 10, color: isOwn ? 'rgba(255,255,255,0.7)' : palette.textSecondary, marginTop: 2, alignSelf: 'flex-end' }}>
            {formatMessageTime(msg.sentAt)}
          </Typography>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <View style={styles.header}>
        <Ionicons name="chatbubbles-outline" size={18} color={semanticColors.primary} />
        <Typography variant="bodyMedium" color={semanticColors.primary}>
          Chat ({messages.length})
        </Typography>
      </View>

      <FlatList
        ref={flatRef}
        data={messages}
        keyExtractor={(m) => m.id}
        renderItem={renderMessage}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyChat}>
            <Typography variant="caption" color={palette.textSecondary} align="center">
              Aucun message pour l'instant. Commencez la conversation.
            </Typography>
          </View>
        }
      />

      {/* Input */}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.textInput}
          value={input}
          onChangeText={setInput}
          placeholder="Écrire un message…"
          placeholderTextColor={palette.textSecondary}
          multiline
          maxLength={500}
          returnKeyType="send"
          onSubmitEditing={handleSend}
        />
        <TouchableOpacity
          onPress={handleSend}
          style={[styles.sendBtn, { opacity: input.trim() ? 1 : 0.4 }]}
          disabled={!input.trim()}
          accessibilityLabel="Envoyer le message"
        >
          <Ionicons name="send" size={18} color={palette.white} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, minHeight: 200 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
    backgroundColor: semanticColors.primaryLight,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
  },
  list: { flex: 1 },
  listContent: { padding: spacing.md, gap: spacing.sm, paddingBottom: spacing.lg },
  systemMsg: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  messageRowOwn: { justifyContent: 'flex-end' },
  bubble: {
    maxWidth: '78%',
    borderRadius: radius.lg,
    padding: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  bubbleOwn: {
    backgroundColor: semanticColors.primary,
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    backgroundColor: palette.surface,
    borderBottomLeftRadius: 4,
  },
  emptyChat: {
    paddingVertical: spacing.lg,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: palette.border,
    paddingTop: spacing.sm,
    paddingBottom: Platform.OS === 'ios' ? spacing.sm : 4,
    gap: spacing.sm,
  },
  textInput: {
    flex: 1,
    backgroundColor: palette.surface,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 15,
    color: palette.textPrimary,
    maxHeight: 100,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: semanticColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
