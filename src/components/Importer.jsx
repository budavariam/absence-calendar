import { useReducer, useMemo, useState } from 'react';
import TextField from '@mui/material/TextField';
import TextareaAutosize from '@mui/material/TextareaAutosize';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import CloseIcon from '@mui/icons-material/Close';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import { DISPATCH_ACTION, LOCALSTORAGE_DEFAULT, LOCALSTORAGE_KEY } from '../utils/constants';
import { useLocalStorageSync } from './useLocalStorageSync';
import "./Importer.css";

const IMPORTER_ACTION = {
    SET_OUTPUT: 'SET_OUTPUT',
    SET_ERROR: 'SET_ERROR',
    SET_LOADING: 'SET_LOADING',
    SET_NAME_FIELD: 'SET_NAME_FIELD',
    SET_START_FIELD: 'SET_START_FIELD',
    SET_END_FIELD: 'SET_END_FIELD',
    SET_DATE_FORMAT: 'SET_DATE_FORMAT',
    TOGGLE_INCLUDE_END: 'TOGGLE_INCLUDE_END',
}

const importerReducer = (state, action) => {
    switch (action.type) {
        case IMPORTER_ACTION.SET_OUTPUT:
            return { ...state, outputData: action.value, error: '' }
        case IMPORTER_ACTION.SET_ERROR:
            return { ...state, error: action.value, outputData: '' }
        case IMPORTER_ACTION.SET_LOADING:
            return { ...state, isLoading: action.value }
        case IMPORTER_ACTION.SET_NAME_FIELD:
            return { ...state, nameField: action.value }
        case IMPORTER_ACTION.SET_START_FIELD:
            return { ...state, startDateField: action.value }
        case IMPORTER_ACTION.SET_END_FIELD:
            return { ...state, endDateField: action.value }
        case IMPORTER_ACTION.SET_DATE_FORMAT:
            return { ...state, dateFormat: action.value }
        case IMPORTER_ACTION.TOGGLE_INCLUDE_END:
            return { ...state, includeEndDate: !state.includeEndDate }
        default:
            return state
    }
}

export const CSVConverter = ({ dispatch }) => {
    const [uiState, uiDispatch] = useReducer(importerReducer, {
        outputData: '',
        error: '',
        isLoading: false,
        nameField: '',
        startDateField: '',
        endDateField: '',
        dateFormat: 'DD-MMM-YYYY',
        includeEndDate: true,
    })

    const [csvModalOpen, setCsvModalOpen] = useState(false);

    const [inputData, setInputData] = useLocalStorageSync(
        LOCALSTORAGE_KEY.IMPORTER_INPUT,
        LOCALSTORAGE_DEFAULT.IMPORTER_INPUT
    );
    const [uniqueNames, setUniqueNames] = useLocalStorageSync(
        LOCALSTORAGE_KEY.FAVOURITE_MEMBERS,
        LOCALSTORAGE_DEFAULT.FAVOURITE_MEMBERS
    );

    const { headers, dataRows, delimiter } = useMemo(() => {
        if (!inputData.trim()) {
            return { headers: [], dataRows: [], delimiter: ';' };
        }

        const lines = inputData.split('\n').filter(l => l.trim() !== '');
        if (lines.length === 0) {
            return { headers: [], dataRows: [], delimiter: ';' };
        }

        const headerLine = lines[0];
        const dataLines = lines.slice(1);
        const detectedDelimiter = headerLine.includes('\t') ? '\t' : ';';

        return {
            headers: headerLine.split(detectedDelimiter).map(h => h.trim()),
            dataRows: dataLines,
            delimiter: detectedDelimiter
        };
    }, [inputData]);

    const parseDataToJSON = (separator = ';') => {
        if (headers.length < 3) throw new Error('Please provide at least 3 columns in your CSV');
        if (dataRows.length === 0) throw new Error('Please provide data rows in your CSV');

        const idxName = headers.indexOf(uiState.nameField);
        const idxStart = headers.indexOf(uiState.startDateField);
        const idxEnd = headers.indexOf(uiState.endDateField);
        if (idxName === -1 || idxStart === -1 || idxEnd === -1) throw new Error('Please map all required fields');

        const monthMap = {
            Jan: '01', Feb: '02', Mar: '03', Apr: '04',
            May: '05', Jun: '06', Jul: '07', Aug: '08',
            Sep: '09', Oct: '10', Nov: '11', Dec: '12'
        };

        const convertDate = (dateStr) => {
            if (!dateStr) return '';
            if (uiState.dateFormat === 'DD-MMM-YYYY') {
                const parts = dateStr.split('-');
                if (parts.length !== 3) return dateStr;
                return `${parts[2]}-${monthMap[parts[1]] || parts[1]}-${parts[0].padStart(2, '0')}`;
            }
            return dateStr;
        };

        const addDayToDate = (dateStr) => {
            if (!dateStr) return '';
            try {
                const date = new Date(dateStr);
                date.setDate(date.getDate() + 1);
                return date.toISOString().split('T')[0];
            } catch {
                return dateStr;
            }
        };

        return dataRows.map(row => {
            const cols = row.split(separator);
            const startDate = convertDate(cols[idxStart]?.trim());
            const endDate = convertDate(cols[idxEnd]?.trim());
            return {
                who: cols[idxName]?.trim(),
                start: startDate,
                end: uiState.includeEndDate ? addDayToDate(endDate) : endDate
            };
        }).filter(r => r.who && r.start && r.end);
    };

    const handleGenerate = () => {
        uiDispatch({ type: IMPORTER_ACTION.SET_LOADING, value: true });
        try {
            if (!inputData.trim()) throw new Error('Please provide CSV data');
            const jsonData = parseDataToJSON(delimiter);
            const formatted = JSON.stringify(jsonData, null, 2);
            uiDispatch({ type: IMPORTER_ACTION.SET_OUTPUT, value: formatted });
            const names = [...new Set(jsonData.map(item => item.who))];
            setUniqueNames(JSON.stringify(names));
        } catch (err) {
            uiDispatch({ type: IMPORTER_ACTION.SET_ERROR, value: err.message });
            setUniqueNames('');
        } finally {
            uiDispatch({ type: IMPORTER_ACTION.SET_LOADING, value: false });
        }
    };

    const saveToEvents = () => {
        try {
            const parsedData = JSON.parse(uiState.outputData);
            const jsonString = JSON.stringify(parsedData);
            window.localStorage.setItem(LOCALSTORAGE_KEY.RAWEVENTDATA, jsonString);
            window.dispatchEvent(new CustomEvent('localStorageChange', {
                detail: { key: LOCALSTORAGE_KEY.RAWEVENTDATA, newValue: jsonString }
            }));
            dispatch({ type: DISPATCH_ACTION.UPDATE_EVENT, value: jsonString });
        } catch (err) {
            console.error('Failed to parse output data:', err);
            uiDispatch({ type: IMPORTER_ACTION.SET_ERROR, value: 'Invalid JSON data generated' });
        }
    };

    const saveToFavourites = () => {
        try {
            setUniqueNames(uniqueNames);
            dispatch({ type: DISPATCH_ACTION.UPDATE_FAVOURITES, value: uniqueNames });
        } catch (err) {
            console.error('Failed to save favourites:', err);
            uiDispatch({ type: IMPORTER_ACTION.SET_ERROR, value: 'Failed to save favourites' });
        }
    };

    return (
        <div className="csv-converter">
            <Box display="flex" gap={0.5} alignItems="flex-start">
                <TextField
                    multiline
                    maxRows={4}
                    fullWidth
                    size="small"
                    value={inputData}
                    onChange={(e) => setInputData(e.target.value)}
                    placeholder="Paste CSV/TSV data here (first row = headers)…"
                    inputProps={{ style: { fontFamily: 'monospace', fontSize: 12 } }}
                />
                <IconButton size="small" onClick={() => setCsvModalOpen(true)} title="Open in full screen">
                    <OpenInFullIcon fontSize="small" />
                </IconButton>
            </Box>

            <Dialog open={csvModalOpen} fullScreen>
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
                    CSV / TSV Data
                    <IconButton onClick={() => setCsvModalOpen(false)}><CloseIcon /></IconButton>
                </DialogTitle>
                <DialogContent sx={{ display: 'flex', flexDirection: 'column', pt: 1 }}>
                    <TextField
                        multiline
                        fullWidth
                        value={inputData}
                        onChange={(e) => setInputData(e.target.value)}
                        placeholder="Paste CSV/TSV data here (first row = headers)…"
                        inputProps={{ style: { fontFamily: 'monospace', fontSize: 13 } }}
                        sx={{ flex: 1, '& .MuiInputBase-root': { height: '100%', alignItems: 'flex-start' } }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setCsvModalOpen(false)}>Close</Button>
                </DialogActions>
            </Dialog>

            {headers.length > 0 && (
                <Box sx={{ mt: 1.5 }}>
                    <Typography variant="caption" color="text.secondary">
                        <strong>{delimiter === '\t' ? 'TSV' : 'CSV'}</strong> · {headers.join(' | ')} · {dataRows.length} rows
                    </Typography>
                </Box>
            )}

            {headers.length > 0 && (
                <Box sx={{ mt: 1.5, display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        Field Mapping
                    </Typography>
                    <Select
                        value={uiState.nameField}
                        onChange={(e) => uiDispatch({ type: IMPORTER_ACTION.SET_NAME_FIELD, value: e.target.value })}
                        displayEmpty
                        size="small"
                        fullWidth
                    >
                        <MenuItem value=""><em>Employee name field</em></MenuItem>
                        {headers.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
                    </Select>
                    <Select
                        value={uiState.startDateField}
                        onChange={(e) => uiDispatch({ type: IMPORTER_ACTION.SET_START_FIELD, value: e.target.value })}
                        displayEmpty
                        size="small"
                        fullWidth
                    >
                        <MenuItem value=""><em>From date field</em></MenuItem>
                        {headers.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
                    </Select>
                    <Select
                        value={uiState.endDateField}
                        onChange={(e) => uiDispatch({ type: IMPORTER_ACTION.SET_END_FIELD, value: e.target.value })}
                        displayEmpty
                        size="small"
                        fullWidth
                    >
                        <MenuItem value=""><em>To date field</em></MenuItem>
                        {headers.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
                    </Select>
                </Box>
            )}

            <TextField
                label="Date Format"
                value={uiState.dateFormat}
                onChange={(e) => uiDispatch({ type: IMPORTER_ACTION.SET_DATE_FORMAT, value: e.target.value })}
                size="small"
                sx={{ mt: 1.5 }}
                fullWidth
            />

            <FormControlLabel
                control={
                    <Checkbox
                        checked={uiState.includeEndDate}
                        onChange={() => uiDispatch({ type: IMPORTER_ACTION.TOGGLE_INCLUDE_END })}
                        size="small"
                    />
                }
                label={<Typography variant="body2">To date is inclusive</Typography>}
                sx={{ mt: 0.5 }}
            />

            <Box display="flex" gap={1} mt={1.5} flexWrap="wrap">
                <Button
                    variant="contained"
                    onClick={handleGenerate}
                    disabled={uiState.isLoading || headers.length === 0}
                    size="small"
                >
                    Generate JSON
                </Button>
            </Box>

            {uiState.error && <Alert severity="error" sx={{ mt: 1.5 }}>{uiState.error}</Alert>}

            {uiState.outputData && (
                <Box mt={2}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        JSON Output
                    </Typography>
                    <pre style={{
                        background: '#f4f4f4',
                        padding: '8px',
                        borderRadius: '4px',
                        overflowX: 'auto',
                        fontSize: '11px',
                        maxHeight: '200px',
                        overflowY: 'auto',
                        marginTop: 4,
                    }}>
                        {uiState.outputData}
                    </pre>
                    <Button variant="contained" size="small" sx={{ mt: 1 }} onClick={saveToEvents}>
                        Import to Events
                    </Button>
                </Box>
            )}

            {uniqueNames && (
                <Box mt={2}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        Unique Names
                    </Typography>
                    <TextField
                        multiline
                        maxRows={3}
                        fullWidth
                        size="small"
                        value={uniqueNames}
                        onChange={(e) => setUniqueNames(e.target.value)}
                        inputProps={{ style: { fontFamily: 'monospace', fontSize: 12 } }}
                        sx={{ mt: 0.5 }}
                    />
                    <Button variant="contained" size="small" sx={{ mt: 1 }} onClick={saveToFavourites}>
                        Update Favourites
                    </Button>
                </Box>
            )}
        </div>
    );
};
