import { Typography } from '@mui/material';

export default function NewsPage() {
    return (
        <main>
            <section className="block-title">
                <Typography variant="h5" style={{color: 'rgba(0, 0, 0, 0.6)', textAlign: 'center'}}>Новости</Typography>
            </section>
            <section>
                <center>
                    <Typography variant="h5" sx={{color: 'rgba(255, 255, 255, 0.8)', margin: '50px 0 0 0'}}>Новостей нет</Typography>
                </center>
            </section>
        </main>
    )
}