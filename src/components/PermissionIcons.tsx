import React, {FC, useState} from 'react';
import {Pressable, StyleSheet, View} from 'react-native';

import {SvgProps} from 'react-native-svg';

import DynamicColors from '@components/DynamicColors';

import {modifyCallPermission} from '@utils/Calls/APICalls';
import DirectChat from '@utils/DirectChats/DirectChat';
import {ContentType} from '@utils/Messaging/interfaces';
import SendMessage from '@utils/Messaging/Send/SendMessage';
import {setRemoteNotificationPermissionsForChats} from '@utils/Notifications';
import {
  pauseContactPortForDirectChat,
  resumeContactPortForDirectChat,
} from '@utils/Ports';
import {
  BooleanPermissions,
  PermissionsStrict,
} from '@utils/Storage/DBCalls/permissions/interfaces';
import {updatePermissions} from '@utils/Storage/permissions';
import {getLabelByTimeDiff} from '@utils/Time';

import BellDisabledDark from '@assets/dark/icons/BellDisabled.svg';
import CallDisabledDark from '@assets/dark/icons/CallDisabled.svg';
import CheckCircleDisabledDark from '@assets/dark/icons/CheckCircleDisabled.svg';
import DisappearingMessageDisabledDark from '@assets/dark/icons/DisappearingMessageDisabled.svg';
import DownloadDisabledDark from '@assets/dark/icons/DownloadDisabled.svg';
import HomeDisabledDark from '@assets/dark/icons/HomeDisabled.svg';
import ProfileDisabledDark from '@assets/dark/icons/ProfileDisabled.svg';
import ShareContactDisabledDark from '@assets/dark/icons/ShareContactDisabled.svg';
import BellRed from '@assets/icons/BellRed.svg';
import CallEnabled from '@assets/icons/CallEnabled.svg';
import CheckCircleOrange from '@assets/icons/CheckCircleOrange.svg';
import DisappearingMessageBlue from '@assets/icons/DisappearingMessageBlue.svg';
import DownloadTeal from '@assets/icons/DownloadTeal.svg';
import HomeSafron from '@assets/icons/HomeSafron.svg';
import ProfileTeal from '@assets/icons/ProfileTeal.svg';
import ShareContactGreen from '@assets/icons/ShareContactGreen.svg';
import BellDisabled from '@assets/light/icons/BellDisabled.svg';
import CallDisabled from '@assets/light/icons/CallDisabled.svg';
import CheckCircleDisabled from '@assets/light/icons/CheckCircleDisabled.svg';
import DisappearingMessageDisabled from '@assets/light/icons/DisappearingMessageDisabled.svg';
import DownloadDisabled from '@assets/light/icons/DownloadDisabled.svg';
import HomeDisabled from '@assets/light/icons/HomeDisabled.svg';
import ProfileDisabled from '@assets/light/icons/ProfileDisabled.svg';
import ShareContactDisabled from '@assets/light/icons/ShareContactDisabled.svg';

import {useTheme} from 'src/context/ThemeContext';

import DissapearingMessagesBottomsheet from './Reusable/BottomSheets/DissapearingMessagesBottomSheet';


/**
 * Returns a JSX element representing an icon with a background color based on the provided permission state.
 *
 * @param {Array<string, boolean>} permission - A tuple where the first element is the permission name and the second is a boolean indicating whether the permission is enabled.
 * @returns {JSX.Element | null} - A circular `View` JSX element representing the icon with the appropriate background color, or null if the permission is not found.
 */

type PermissionConfig = {
  bgColor: string;
  enabledIcon: FC<SvgProps>;
  disabledIconLight: FC<SvgProps>;
  disabledIconDark: FC<SvgProps>;
};

interface PermissionConfigMap {
  notifications: PermissionConfig;
  autoDownload: PermissionConfig;
  focus: PermissionConfig;
  contactSharing: PermissionConfig;
  disappearingMessages: PermissionConfig;
  readReceipts: PermissionConfig;
  displayPicture: PermissionConfig;
  calling: PermissionConfig;
}

const permissionConfigMap: PermissionConfigMap = {
  notifications: {
    bgColor: 'brightRed',
    enabledIcon: BellRed,
    disabledIconLight: BellDisabled,
    disabledIconDark: BellDisabledDark,
  },
  autoDownload: {
    bgColor: 'tealBlue',
    enabledIcon: DownloadTeal,
    disabledIconLight: DownloadDisabled,
    disabledIconDark: DownloadDisabledDark,
  },
  focus: {
    bgColor: 'deepSafron',
    enabledIcon: HomeSafron,
    disabledIconLight: HomeDisabled,
    disabledIconDark: HomeDisabledDark,
  },
  contactSharing: {
    bgColor: 'darkGreen',
    enabledIcon: ShareContactGreen,
    disabledIconLight: ShareContactDisabled,
    disabledIconDark: ShareContactDisabledDark,
  },
  disappearingMessages: {
    bgColor: 'blue',
    enabledIcon: DisappearingMessageBlue,
    disabledIconLight: DisappearingMessageDisabled,
    disabledIconDark: DisappearingMessageDisabledDark,
  },
  readReceipts: {
    bgColor: 'orange',
    enabledIcon: CheckCircleOrange,
    disabledIconLight: CheckCircleDisabled,
    disabledIconDark: CheckCircleDisabledDark,
  },
  displayPicture: {
    bgColor: 'blue',
    enabledIcon: ProfileTeal,
    disabledIconLight: ProfileDisabled,
    disabledIconDark: ProfileDisabledDark,
  },
  calling: {
    bgColor: 'purple',
    enabledIcon: CallEnabled,
    disabledIconLight: CallDisabled,
    disabledIconDark: CallDisabledDark,
  },
};

const PermissionIcons = ({
  permissions,
  setPermissions,
  permissionsId,
  chatId,
}: {
  permissionsId: string;
  chatId: string;
  permissions: PermissionsStrict;
  setPermissions: (permissions: PermissionsStrict) => void;
}) => {
  const onUpdateNotificationPermission = async () => {
    const newNotificationPermissionState = !permissions.notifications;
    // Toggle the notification switch immediately to give the user immediate feedback
    setPermissions({
      ...permissions,
      ['notifications']: newNotificationPermissionState,
    });
    if (chatId) {
      const directChat = new DirectChat(chatId);
      const lineId = (await directChat.getChatData()).lineId;
      // We have a specific chat to update
      // API call to udpate a single chatId on the backend
      try {
        await setRemoteNotificationPermissionsForChats(
          newNotificationPermissionState,
          [{id: lineId, type: 'line'}],
        );
      } catch (e) {
        console.error(
          '[NOTIFICATION PERMISSION] Could not update permissions',
          e,
        );
        // If the API call fails, toggle back to old setting
        setPermissions({
          ...permissions,
          ['notifications']: !newNotificationPermissionState,
        });
        return;
      }
    }

    // Update the notification state
    if (permissionsId) {
      await updatePermissions(permissionsId, {
        notifications: newNotificationPermissionState,
      });
    }
  };

  const onUpdateCallPermission = async () => {
    const newCallPermissionState = !permissions.calling;
    // Toggle the notification switch immediately to give the user immediate feedback
    setPermissions({
      ...permissions,
      ['calling']: newCallPermissionState,
    });
    if (chatId) {
      const directChat = new DirectChat(chatId);
      const lineId = (await directChat.getChatData()).lineId;
      // We have a specific chat to update
      // API call to udpate a single chatId on the backend
      try {
        await modifyCallPermission(lineId, newCallPermissionState);
      } catch (e) {
        console.error('[CALL PERMISSION] Could not update permissions', e);
        // If the API call fails, toggle back to old setting
        setPermissions({
          ...permissions,
          ['calling']: !newCallPermissionState,
        });
        return;
      }
    }
    // Update the notification state
    if (permissionsId) {
      await updatePermissions(permissionsId, {
        calling: newCallPermissionState,
      });
    }
  };

  const onUpdateBooleanPermission = async (
    permissionKey: keyof BooleanPermissions,
  ) => {
    const updatedPermissions: PermissionsStrict = {
      ...permissions,
      [permissionKey]: !permissions[permissionKey],
    };
    if (permissionsId) {
      await updatePermissions(permissionsId, updatedPermissions);
    }
    setPermissions(updatedPermissions);
  };
  async function toggleContactSharing() {
    const oldPermissions = permissions;
    const newPermission = !permissions.contactSharing;
    const updatedPermissions: PermissionsStrict = {
      ...permissions,
      ['contactSharing']: newPermission,
    };
    setPermissions(updatedPermissions);
    if (newPermission && chatId) {
      try {
        await resumeContactPortForDirectChat(chatId);
        if (permissionsId) {
          await updatePermissions(permissionsId, updatedPermissions);
        }
      } catch (e) {
        console.error('Could not resume contact port', e);
        setPermissions(oldPermissions);
        if (permissionsId) {
          await updatePermissions(permissionsId, oldPermissions);
        }
        return;
      }
    } else if (chatId) {
      try {
        await pauseContactPortForDirectChat(chatId);
        if (permissionsId) {
          await updatePermissions(permissionsId, updatedPermissions);
        }
      } catch (e) {
        console.error('Could not pause contact port', e);
        setPermissions(oldPermissions);
        if (permissionsId) {
          await updatePermissions(permissionsId, oldPermissions);
        }
        return;
      }
    }
  }
  //controls dissapearing messages modal
  const [showDesappearingMessageModal, setShowDissappearingMessageModal] =
    useState<boolean>(false);
  const onUpdateDisappearingMessagedPermission = async (newValue: number) => {
    if (permissions.disappearingMessages !== newValue) {
      const updatedPermissions = {
        ...permissions,
        ['disappearingMessages']: newValue,
      };

      if (permissionsId) {
        await updatePermissions(permissionsId, updatedPermissions);
      }

      if (chatId) {
        const sender = new SendMessage(
          chatId,
          ContentType.disappearingMessages,
          {
            timeoutValue: newValue,
          },
        );
        await sender.send();
      }

      //Send broadcast here
      setPermissions(updatedPermissions);
    }
  };
  return (
    <View style={styles.wrapContainer}>
      <PermissionIcon
        permission={'notifications'}
        isEnabled={permissions.notifications}
        onToggle={onUpdateNotificationPermission}
      />
      <PermissionIcon
        permission={'calling'}
        isEnabled={permissions.calling}
        onToggle={onUpdateCallPermission}
      />
      <PermissionIcon
        permission={'contactSharing'}
        isEnabled={permissions.contactSharing}
        onToggle={toggleContactSharing}
      />
      <PermissionIcon
        permission={'displayPicture'}
        isEnabled={permissions.displayPicture}
        onToggle={async () => await onUpdateBooleanPermission('displayPicture')}
      />
      <PermissionIcon
        permission={'readReceipts'}
        isEnabled={permissions.readReceipts}
        onToggle={async () => await onUpdateBooleanPermission('readReceipts')}
      />
      <PermissionIcon
        permission={'autoDownload'}
        isEnabled={permissions.autoDownload}
        onToggle={async () => await onUpdateBooleanPermission('autoDownload')}
      />
      <PermissionIcon
        permission={'disappearingMessages'}
        isEnabled={
          getLabelByTimeDiff(permissions.disappearingMessages) !== 'Off'
        }
        onToggle={() => setShowDissappearingMessageModal(true)}
      />
      <DissapearingMessagesBottomsheet
        showDesappearingMessageModal={showDesappearingMessageModal}
        setShowDissappearingMessageModal={setShowDissappearingMessageModal}
        permission={permissions.disappearingMessages}
        onUpdateDisappearingMessagesPermission={
          onUpdateDisappearingMessagedPermission
        }
      />
    </View>
  );
};

const PermissionIcon = ({
  isEnabled,
  onToggle,
  permission,
}: {
  isEnabled: boolean;
  onToggle: () => void;
  permission: keyof PermissionConfigMap;
}) => {
  const Colors = DynamicColors();
  const {themeValue} = useTheme();
  const config = permissionConfigMap[permission];
  return (
    <Pressable
      onPress={onToggle}
      style={StyleSheet.compose(styles.container, {
        backgroundColor: isEnabled
          ? Colors.lowAccentColors[
              config.bgColor as keyof typeof Colors.lowAccentColors
            ]
          : 'transparent',
        borderWidth: 0.5,
        borderColor: isEnabled ? 'transparent' : Colors.primary.darkgrey,
      })}>
      {isEnabled ? (
        <config.enabledIcon width={16} height={16} />
      ) : themeValue === 'light' ? (
        <config.disabledIconLight width={16} height={16} />
      ) : (
        <config.disabledIconDark width={16} height={16} />
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 100,
    padding: 6,
  },
  wrapContainer: {
    width: '100%',
    flexWrap: 'wrap',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
});

export default PermissionIcons;
