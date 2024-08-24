import { Button } from "@mui/material";
import { useRef } from "react";
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import { Api as ApiTypes } from "types/";
import { Api as ApiUrls } from "constants/";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";


export default function UploadPhoto(){

    const navigate = useNavigate();

    const inputRef = useRef<HTMLInputElement>(null);

    function click_on_input(){
        if(!inputRef.current) return;

        inputRef.current.click();
    }

    function handle_change(event: React.ChangeEvent<HTMLInputElement>){
        const files = event.target.files;

        if(!files) return;

        const file = files[0];

        // conver file to base64
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            if(reader.result){
                const base64 = reader.result as string;

                upload_photo(base64.split(',')[1]);
            }
        }
    }

    async function upload_photo(base64_str: string){
        const url = ApiUrls.uploadPhoto();

        const data : ApiTypes.UploadUserPhotoRequestType = {
            image: base64_str
        }

        let image_id = localStorage.getItem('image_id');

        if(image_id && image_id !== 'null'){
            axios.delete(url, {
                data:{
                    image_id: parseInt(image_id)
                }
            }, 
            )
            .then(
                res => {
                    return axios.post(url, data);
                }
            )
            .then(
                res => {
                    const data : ApiTypes.GetUserPhotoResponseType = res.data;
                    const {path} = data;
                    let newPath = path.replace('.jpeg', '');
                    newPath = newPath.replace('images/', 'image/');
                    // newPath - image/{image_id}
                    let image_id = newPath.split('/')[1];
                    localStorage.setItem('image_id', image_id);
                    localStorage.setItem('user_photo', newPath);
                    navigate(0);
                }
            )
            .catch(
                err => {

                    if(err.response?.status === 500){
                        toast.error('Проблемы с обработкой данных, повторите запрос');
                    } else {
                        toast.error('Не удалось загрузить фото');
                    }

                    console.log(err);
                }
            )
        }

        else{
            axios.post(url, data)
            .then(
                res => {
                    const data : ApiTypes.GetUserPhotoResponseType = res.data;
                    const {path} = data;
                    localStorage.setItem('user_photo', path);
                    navigate(0);
                }
            )
            .catch(
                err => {
                    toast.error('Не удалось загрузить фото');
                    console.log(err);
                }
            )
        }

    }

    return (
        <section style={{width: 'fit-content', margin: '0 auto'}}>
            <input type="file" 
            ref={inputRef} 
            hidden
            onChange={handle_change}
            accept="image/png, image/jpeg"
            />
            <Button
                variant="outlined"
                color="secondary"
                onClick={click_on_input}
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