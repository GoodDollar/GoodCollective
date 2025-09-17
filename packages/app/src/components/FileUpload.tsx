import { useRef, useState } from 'react';
import { Platform } from 'react-native';
import { Box, Center, Image, Pressable, Text } from 'native-base';

import { UploadIcon } from '../assets';

const FileUpload = ({ style, onUpload }: { style: Object | {}; onUpload: Function }) => {
  const uploader = useRef<HTMLInputElement | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const isWeb = Platform.OS === 'web';

  return (
    <Pressable onPress={isWeb ? () => uploader.current?.click() : undefined}>
      <Box
        style={style as {}}
        borderWidth={2}
        borderRadius={8}
        borderStyle="dotted"
        borderColor="gray.300"
        backgroundColor="white"
        mt={2}
        padding={6}>
        <Center>
          {isWeb ? <img src={UploadIcon} alt="" /> : <Image source={UploadIcon} alt="" />}
          {!fileName && <Text>Click to upload</Text>}
          <Text overflow="hidden">{fileName}</Text>
        </Center>
      </Box>
      {isWeb && (
        <input
          style={{ display: 'none' }}
          ref={uploader}
          type="file"
          name="myImage"
          accept="image/svg+xml,image/png,image/jpeg,image/gif"
          onChange={(event) => {
            if (!event.target.files) return;
            setFileName(event.target.files[0].name);
            onUpload(event.target.files[0]);
          }}
        />
      )}
    </Pressable>
  );
};

export default FileUpload;
