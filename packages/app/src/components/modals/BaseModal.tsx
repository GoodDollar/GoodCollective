import { Modal, Platform } from 'react-native';
import { Image, Link, Pressable, Text, VStack } from 'native-base';

import ActionButton from '../ActionButton';
import { CloseIcon, ThankYouImg } from '../../assets';

const modalView = {
  maxHeight: '90%',
  // @ts-ignore
  overflowY: Platform.select({
    native: 'scroll',
    default: 'auto',
  }) as any,
  margin: 5,
  backgroundColor: 'goodPurple.300',
  borderRadius: 20,
  paddingTop: 8,
  paddingX: 8,
  paddingBottom: 10,
  ...Platform.select({
    web: {
      gap: 24,
      maxWidth: '420',
    },
    native: {
      maxWidth: '90%',
    },
  }),
  alignItems: 'center',
};

const defaultModalProps = {
  error: {
    dTitle: 'Something went wrong',
    dParagraphs: (errorMessage: string) => {
      const safeMessage = errorMessage ?? 'unknown';

      // Special handling for messages that include an external link (e.g. https://gooddapp.org)
      const goodDappUrl = 'https://gooddapp.org';
      const hasGoodDappLink = safeMessage.includes(goodDappUrl);

      if (!hasGoodDappLink) {
        return ['Please try again later.', 'Reason: ' + safeMessage];
      }

      const [beforeLink, afterLink] = safeMessage.split(goodDappUrl);

      return [
        'Please try again later.',
        <Text key="reason-with-link" variant="bold" fontSize="md" textAlign="center">
          {'Reason: '}
          {beforeLink}
          <Link href={goodDappUrl} isExternal textDecorationLine="underline">
            {goodDappUrl}
          </Link>
          {afterLink}
        </Text>,
      ];
    },
    dConfirmButtonText: 'OK',
    dImage: ThankYouImg,
    dMessage: 'Something went wrong',
  },
};

type BaseModalProps = {
  type?: 'error';
  openModal: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title?: string;
  paragraphs?: any[] | undefined;
  confirmButtonText?: string;
  image?: any;
  errorMessage?: string;
  withClose?: boolean;
  message?: string;
  confirmDisabled?: boolean;
};

export const BaseModal = ({
  type,
  openModal,
  onClose,
  onConfirm,
  title,
  paragraphs,
  confirmButtonText,
  image,
  errorMessage = '',
  withClose = true,
  message,
  confirmDisabled = false,
}: BaseModalProps) => {
  const _onClose = () => onClose();
  const { dTitle, dParagraphs, dConfirmButtonText, dImage, dMessage } =
    type === 'error'
      ? defaultModalProps[type as keyof typeof defaultModalProps]
      : {
          dTitle: title,
          dParagraphs: paragraphs,
          dConfirmButtonText: confirmButtonText,
          dImage: image,
          dMessage: message,
        };

  const paragraph =
    type === 'error' && typeof dParagraphs === 'function'
      ? dParagraphs?.(errorMessage)
      : (dParagraphs as any[] | undefined);

  return (
    <Modal
      style={{ flex: 1, justifyContent: 'center', alignItems: 'center', maxWidth: '420' }}
      animationType="slide"
      transparent={true}
      visible={openModal}>
      <VStack mt={60} flex={1} justifyContent="center" alignItems="center" backgroundColor="black:alpha.80">
        <VStack
          {...modalView}
          style={{
            shadowColor: 'black',
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 4,
            elevation: 5,
          }}>
          {withClose ? (
            <VStack width="100%" alignContent="flex-end">
              <Pressable w={8} h={8} alignSelf="flex-end" onPress={_onClose}>
                <Image source={CloseIcon} width={8} height={8} alignSelf="flex-end" alt="Close" />
              </Pressable>
            </VStack>
          ) : null}
          <VStack space={4}>
            <Text variant="bold" fontSize="xl" lineHeight="120%" textAlign={'center'}>
              {dTitle?.toUpperCase()}
            </Text>
            <VStack space={0} textAlign="center">
              {paragraph
                ? paragraph.map((item: any, index: number) => {
                    if (!item) return null;
                    if (typeof item === 'string') {
                      return (
                        <Text key={index} variant="bold" fontSize="md">
                          {item}
                        </Text>
                      );
                    }
                    // Allow JSX elements (e.g. Text with embedded Link) to be passed directly
                    return (
                      <VStack key={index} alignItems="center">
                        {item}
                      </VStack>
                    );
                  })
                : null}
            </VStack>
            {dImage && (
              <Image
                source={dImage}
                alt={dTitle || 'Modal image'}
                width={'100%'}
                height={210}
                margin="auto"
                resizeMode="contain"
              />
            )}
            {dMessage && (
              <Text variant="bold" fontSize="sm" textAlign="center">
                {message}
              </Text>
            )}
            {dConfirmButtonText ? (
              <ActionButton
                text={dConfirmButtonText}
                onPress={onConfirm}
                bg="goodOrange.200"
                textColor="goodOrange.500"
                isDisabled={confirmDisabled}
              />
            ) : null}
          </VStack>
        </VStack>
      </VStack>
    </Modal>
  );
};

export default BaseModal;
