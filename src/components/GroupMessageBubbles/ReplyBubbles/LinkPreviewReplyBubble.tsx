import React, {ReactNode} from 'react';
import {Image, StyleSheet, View} from 'react-native';

import {PortSpacing} from '@components/ComponentUtils';
import DynamicColors from '@components/DynamicColors';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';

import {LinkParams} from '@utils/Messaging/interfaces';
import {GroupReplyContent} from '@utils/Storage/DBCalls/groupMessage';
import {getSafeAbsoluteURI} from '@utils/Storage/StorageRNFS/sharedFileHandlers';

import {
  MAX_WIDTH_REPLY,
  MIN_WIDTH_REPLY,
  REPLY_MEDIA_HEIGHT,
  REPLY_MEDIA_WIDTH,
  memberIdToHex,
} from '../BubbleUtils';

/**
 * Extend supported content types to support more types of content bubbles.
 */
export const LinkPreviewReplyBubble = ({
  reply,
  memberName,
}: {
  reply: GroupReplyContent;
  memberName: string;
}): ReactNode => {
  const ogImage = (reply.data as LinkParams).fileUri;
  const Colors = DynamicColors();
  const styles = styling(Colors);
  const mainColor = memberIdToHex(
    reply.memberId,
    Colors.boldAccentColors,
    Colors.messagebubble.border,
  );

  return (
    <View style={styles.container}>
      <View style={{...styles.replyContainer, borderColor: mainColor}}>
        <NumberlessText
          fontSizeType={FontSizeType.m}
          fontType={FontType.md}
          textColor={mainColor}
          numberOfLines={1}>
          {memberName}
        </NumberlessText>
        <NumberlessText
          fontSizeType={FontSizeType.m}
          fontType={FontType.rg}
          textColor={Colors.text.primary}
          numberOfLines={3}>
          {(reply.data as LinkParams).text}
        </NumberlessText>
      </View>
      {ogImage && (
        <View style={styles.imageContainer}>
          <Image
            style={styles.image}
            source={{
              uri: getSafeAbsoluteURI(ogImage, 'doc'),
            }}
          />
        </View>
      )}
    </View>
  );
};

const styling = Colors =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      minHeight: REPLY_MEDIA_HEIGHT,
      minWidth: MIN_WIDTH_REPLY,
      justifyContent: 'space-between',
      backgroundColor: Colors.primary.surface,
      borderRadius: 12,
      overflow: 'hidden',
    },
    replyContainer: {
      flexDirection: 'column',
      justifyContent: 'flex-start',
      paddingVertical: PortSpacing.tertiary.uniform,
      paddingHorizontal: PortSpacing.tertiary.left,
      borderLeftWidth: 4,
      borderColor: Colors.messagebubble.border,
      maxWidth: MAX_WIDTH_REPLY - REPLY_MEDIA_WIDTH,
    },
    imageContainer: {
      width: REPLY_MEDIA_WIDTH,
    },
    image: {
      flex: 1,
      width: REPLY_MEDIA_WIDTH, // Set the maximum width you desire
    },
  });
