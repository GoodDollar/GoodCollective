import { useRef, useState } from 'react';
import { Box, Center, Pressable, Text } from 'native-base';

import { UploadIcon } from '../assets';

const FileUpload = ({ style, onUpload }: { style: Object | {}; onUpload: Function }) => {
  const uploader = useRef(null);
  const [fileName, setFileName] = useState<string>('');

  return (
    <Pressable onPress={() => (uploader.current as unknown as HTMLInputElement)?.click()}>
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
          <img src={UploadIcon} alt="" />
          {!fileName && <Text>Click to upload</Text>}
          <Text overflow="hidden">{fileName}</Text>
        </Center>
      </Box>
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
    </Pressable>
  );
};

export default FileUpload;
