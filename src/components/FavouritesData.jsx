import { useState } from 'react';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import CloseIcon from '@mui/icons-material/Close';
import { DISPATCH_ACTION, LOCALSTORAGE_DEFAULT, LOCALSTORAGE_KEY } from '../utils/constants';
import { useLocalStorageSync } from './useLocalStorageSync';

export const FavouritesData = ({ dispatch }) => {
    const [modalOpen, setModalOpen] = useState(false);
    const [rawFavouritesData, setRawFavouritesData] = useLocalStorageSync(
        LOCALSTORAGE_KEY.FAVOURITE_MEMBERS,
        LOCALSTORAGE_DEFAULT.FAVOURITE_MEMBERS
    );

    const applyChanges = () => {
        dispatch({ type: DISPATCH_ACTION.UPDATE_FAVOURITES, value: rawFavouritesData });
    };

    return (
        <>
            <Box display="flex" gap={0.5} alignItems="flex-start">
                <TextField
                    multiline
                    maxRows={4}
                    fullWidth
                    size="small"
                    value={rawFavouritesData}
                    onChange={(e) => setRawFavouritesData(e.target.value)}
                    onBlur={applyChanges}
                    inputProps={{ style: { fontFamily: 'monospace', fontSize: 12 } }}
                />
                <IconButton size="small" onClick={() => setModalOpen(true)} title="Open in full screen">
                    <OpenInFullIcon fontSize="small" />
                </IconButton>
            </Box>

            <Dialog open={modalOpen} fullScreen>
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
                    Favourites (JSON)
                    <IconButton onClick={() => setModalOpen(false)}><CloseIcon /></IconButton>
                </DialogTitle>
                <DialogContent sx={{ display: 'flex', flexDirection: 'column', pt: 1 }}>
                    <TextField
                        multiline
                        fullWidth
                        value={rawFavouritesData}
                        onChange={(e) => setRawFavouritesData(e.target.value)}
                        inputProps={{ style: { fontFamily: 'monospace', fontSize: 13 } }}
                        sx={{ flex: 1, '& .MuiInputBase-root': { height: '100%', alignItems: 'flex-start' } }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setModalOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={() => { applyChanges(); setModalOpen(false); }}>
                        Apply & Close
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};
