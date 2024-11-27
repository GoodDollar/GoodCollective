import { Modal, Platform } from 'react-native';
import { Image, Pressable, Text, VStack } from 'native-base';

import ActionButton from '../ActionButton';
import { CloseIcon, ThankYouImg } from '../../assets';

const modalView = {
  maxHeight: '90%',
  // @ts-ignore
  overflowY: Platform.select({
    native: 'scroll',
    default: 'auto',
  }) as any,
  margin: 20,
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
    dParagraphs: (errorMessage: string) => ['Please try again later.', 'Reason: ' + (errorMessage ?? 'unknown')],
    dConfirmButtonText: 'OK',
    dImage: ThankYouImg,
  },
};

type BaseModalProps = {
  type?: 'error';
  openModal: boolean;
  setOpenModal: (open: boolean) => void;
  onConfirm?: () => void;
  title?: string;
  paragraphs?: any[] | undefined;
  confirmButtonText?: string;
  image?: any;
  errorMessage?: string;
  withClose?: boolean;
};

export const BaseModal = ({
  type,
  openModal,
  setOpenModal,
  onConfirm,
  title,
  paragraphs,
  confirmButtonText,
  image,
  errorMessage = '',
  withClose = true,
}: BaseModalProps) => {
  const onClose = () => setOpenModal(false);
  const { dTitle, dParagraphs, dConfirmButtonText, dImage } =
    type === 'error'
      ? defaultModalProps[type as keyof typeof defaultModalProps]
      : { dTitle: title, dParagraphs: paragraphs, dConfirmButtonText: confirmButtonText, dImage: image };

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
              <Pressable w={8} h={8} alignSelf="flex-end" onPress={onClose}>
                <Image source={CloseIcon} width={8} height={8} alignSelf="flex-end" />
              </Pressable>
            </VStack>
          ) : null}
          <VStack space={4} justifyContent="center">
            <Text variant="bold" fontSize="xl" lineHeight="120%">
              {dTitle?.toUpperCase()}
            </Text>
            <VStack space={0} textAlign="center">
              {paragraph
                ? // eslint-disable-next-line @typescript-eslint/no-shadow
                  paragraph.map((paragraph: string, index: number) =>
                    paragraph ? (
                      <Text key={index} variant="bold" fontSize="md">
                        {paragraph}
                      </Text>
                    ) : null
                  )
                : null}
            </VStack>
            <Image source={dImage} alt="woman" width={'100%'} height={224} margin="auto" resizeMode="contain" />
            {dConfirmButtonText ? (
              <ActionButton
                text={dConfirmButtonText}
                onPress={onConfirm}
                bg="goodOrange.200"
                textColor="goodOrange.500"
              />
            ) : null}
          </VStack>
        </VStack>
      </VStack>
    </Modal>
  );
};

export default BaseModal;
