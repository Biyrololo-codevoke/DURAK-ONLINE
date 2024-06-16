import { Button } from "@mui/material";
import { useRef } from "react";
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';


export default function UploadPhoto(){

    const inputRef = useRef<HTMLInputElement>(null);

    function upload_photo(){
        if(!inputRef.current) return;

        inputRef.current.click();
    }

    return (
        <section style={{width: 'fit-content', margin: '0 auto'}}>
            <input type="file" ref={inputRef} hidden/>
            <Button
                variant="outlined"
                color="secondary"
                onClick={upload_photo}
                style={
                    {
                        boxSizing: 'border-box',
                        padding: '10px 80px',
                        borderRadius: 60,
                        textTransform: 'none',
                        position: 'relative',
                    }
                }
            >
                Загрузить фото
                <PhotoCameraIcon 
                fontSize="large"
                style={
                    {
                        position: 'absolute',
                        right: '15px',
                    }
                }
                />
            </Button>
        </section>
    )
}