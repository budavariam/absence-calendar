import { useState, useMemo } from 'react';
import TextareaAutosize from '@mui/material/TextareaAutosize';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Collapse from '@mui/material/Collapse';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import { DISPATCH_ACTION, LOCALSTORAGE_DEFAULT, LOCALSTORAGE_KEY } from '../utils/constants';
import { useLocalStorageSync } from './useLocalStorageSync';
import "./Importer.css";

export const CSVConverter = ({ dispatch }) => {
    const [isOpen, setIsOpen] = useState(true);

    const [inputData, setInputData] = useLocalStorageSync(
        LOCALSTORAGE_KEY.IMPORTER_INPUT,
        LOCALSTORAGE_DEFAULT.IMPORTER_INPUT
    );
    const [uniqueNames, setUniqueNames] = useLocalStorageSync(
        LOCALSTORAGE_KEY.FAVOURITE_MEMBERS,
        LOCALSTORAGE_DEFAULT.FAVOURITE_MEMBERS
    );

    // Regular state for UI-only values
    const [outputData, setOutputData] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [nameField, setNameField] = useState('');
    const [startDateField, setStartDateField] = useState('');
    const [endDateField, setEndDateField] = useState('');
    const [dateFormat, setDateFormat] = useState('DD-MMM-YYYY');

    // Extract headers and data rows from the inputData
    const { headers, dataRows } = useMemo(() => {
        if (!inputData.trim()) {
            return { headers: [], dataRows: [] };
        }

        const lines = inputData.split('\n').filter(l => l.trim() !== '');
        if (lines.length === 0) {
            return { headers: [], dataRows: [] };
        }

        const headerLine = lines[0];
        const dataLines = lines.slice(1);

        return {
            headers: headerLine.split(';').map(h => h.trim()),
            dataRows: dataLines
        };
    }, [inputData]);

    const parseDataToJSON = (separator = ';') => {
        if (headers.length < 3) throw new Error('Please provide at least 3 columns in your CSV');
        if (dataRows.length === 0) throw new Error('Please provide data rows in your CSV');

        const idxName = headers.indexOf(nameField);
        const idxStart = headers.indexOf(startDateField);
        const idxEnd = headers.indexOf(endDateField);
        if (idxName === -1 || idxStart === -1 || idxEnd === -1) throw new Error('Please map all required fields');

        const monthMap = {
            Jan: '01', Feb: '02', Mar: '03', Apr: '04',
            May: '05', Jun: '06', Jul: '07', Aug: '08',
            Sep: '09', Oct: '10', Nov: '11', Dec: '12'
        };

        const convertDate = (dateStr) => {
            if (!dateStr) return '';
            if (dateFormat === 'DD-MMM-YYYY') {
                const parts = dateStr.split('-');
                if (parts.length !== 3) return dateStr;
                return `${parts[2]}-${monthMap[parts[1]] || parts[1]}-${parts[0].padStart(2, '0')}`;
            }
            return dateStr;
        };

        return dataRows.map(row => {
            const cols = row.split(separator);
            return {
                who: cols[idxName]?.trim(),
                start: convertDate(cols[idxStart]?.trim()),
                end: convertDate(cols[idxEnd]?.trim())
            };
        }).filter(r => r.who && r.start && r.end);
    };

    const handleGenerate = (separator = ';') => {
        setIsLoading(true);
        setError('');
        try {
            if (!inputData.trim()) throw new Error('Please provide CSV data');
            const jsonData = parseDataToJSON(separator);
            const formatted = JSON.stringify(jsonData, null, 2);
            setOutputData(formatted);
            const names = [...new Set(jsonData.map(item => item.who))];
            setUniqueNames(JSON.stringify(names));
        } catch (err) {
            setError(err.message);
            setOutputData('');
            setUniqueNames('');
        } finally {
            setIsLoading(false);
        }
    };

    const saveToEvents = () => {
        try {
            const parsedData = JSON.parse(outputData);
            const jsonString = JSON.stringify(parsedData);

            // Update localStorage and dispatch custom event
            window.localStorage.setItem(LOCALSTORAGE_KEY.RAWEVENTDATA, jsonString);
            window.dispatchEvent(new CustomEvent('localStorageChange', {
                detail: { key: LOCALSTORAGE_KEY.RAWEVENTDATA, newValue: jsonString }
            }));

            // Also dispatch to update the main state
            dispatch({ type: DISPATCH_ACTION.UPDATE_EVENT, value: jsonString });
        } catch (err) {
            console.error('Failed to parse output data:', err);
            setError('Invalid JSON data generated');
        }
    };

    const saveToFavourites = () => {
        try {
            // This automatically updates localStorage and dispatches custom event via the hook
            setUniqueNames(uniqueNames);

            // Also dispatch to reducer
            dispatch({ type: DISPATCH_ACTION.UPDATE_FAVOURITES, value: uniqueNames });
        } catch (err) {
            console.error('Failed to save favourites:', err);
            setError('Failed to save favourites');
        }
    };

    return (
        <div className="csv-converter">
            <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6" component="h3">
                    CSV Importer
                </Typography>
                <IconButton onClick={() => setIsOpen(!isOpen)}>
                    {isOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
            </Box>

            <Collapse in={isOpen}>
                <Box mt={2}>
                    <Typography variant="subtitle1">CSV/TSV Data (with headers)</Typography>
                    <TextareaAutosize
                        maxRows={4}
                        style={{ width: '100%', fontFamily: 'monospace', padding: 8 }}
                        value={inputData}
                        onChange={(e) => setInputData(e.target.value)}
                        placeholder="Paste your complete CSV data here (first row should contain headers)..."
                    />

                    {headers.length > 0 && (
                        <Box sx={{ mt: 2 }}>
                            <Typography variant="body2" sx={{ mb: 1 }}>
                                Detected Headers: <strong>{headers.join(' | ')}</strong>
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
                                Data Rows: {dataRows.length}
                            </Typography>
                        </Box>
                    )}

                    {headers.length > 0 && (
                        <Box sx={{ mt: 2 }}>
                            <Typography variant="body2" sx={{ mb: 1 }}>Field Mapping:</Typography>
                            <Box display="flex" flexDirection="column" gap={1}>
                                <Select
                                    value={nameField}
                                    onChange={(e) => setNameField(e.target.value)}
                                    displayEmpty
                                    size="small"
                                    fullWidth
                                    sx={{ maxWidth: '100%' }}
                                >
                                    <MenuItem value="">Select Employee Name Field</MenuItem>
                                    {headers.map(opt => (
                                        <MenuItem key={opt} value={opt} sx={{ wordBreak: 'break-word' }}>
                                            {opt}
                                        </MenuItem>
                                    ))}
                                </Select>
                                <Select
                                    value={startDateField}
                                    onChange={(e) => setStartDateField(e.target.value)}
                                    displayEmpty
                                    size="small"
                                    fullWidth
                                    sx={{ maxWidth: '100%' }}
                                >
                                    <MenuItem value="">Select From Date Field</MenuItem>
                                    {headers.map(opt => (
                                        <MenuItem key={opt} value={opt} sx={{ wordBreak: 'break-word' }}>
                                            {opt}
                                        </MenuItem>
                                    ))}
                                </Select>
                                <Select
                                    value={endDateField}
                                    onChange={(e) => setEndDateField(e.target.value)}
                                    displayEmpty
                                    size="small"
                                    fullWidth
                                    sx={{ maxWidth: '100%' }}
                                >
                                    <MenuItem value="">Select To Date Field</MenuItem>
                                    {headers.map(opt => (
                                        <MenuItem key={opt} value={opt} sx={{ wordBreak: 'break-word' }}>
                                            {opt}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </Box>
                        </Box>
                    )}

                    <TextField
                        label="Date Format"
                        value={dateFormat}
                        onChange={(e) => setDateFormat(e.target.value)}
                        size="small"
                        sx={{ mt: 2 }}
                        fullWidth
                    />

                    <Box display="flex" gap={1} mt={2} flexWrap="wrap">
                        <Button
                            variant="contained"
                            onClick={() => handleGenerate(';')}
                            disabled={isLoading || headers.length === 0}
                            size="small"
                        >
                            Generate from CSV
                        </Button>
                        <Button
                            variant="contained"
                            sx={{ bgcolor: '#e74c3c' }}
                            onClick={() => handleGenerate('\t')}
                            disabled={isLoading || headers.length === 0}
                            size="small"
                        >
                            Generate from TSV
                        </Button>
                    </Box>

                    {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

                    {outputData && (
                        <Box mt={3}>
                            <Typography variant="subtitle1">JSON Output</Typography>
                            <pre style={{
                                background: '#f4f4f4',
                                padding: '10px',
                                borderRadius: '4px',
                                overflowX: 'auto',
                                fontSize: '12px',
                                maxHeight: '300px',
                                overflowY: 'auto'
                            }}>
                                {outputData}
                            </pre>
                            <Button variant="contained" size="small" sx={{ mt: 1 }} onClick={saveToEvents}>
                                Import to Events
                            </Button>
                        </Box>
                    )}

                    {uniqueNames && (
                        <Box mt={3}>
                            <Typography variant="subtitle1">Unique Names</Typography>
                            <TextareaAutosize
                                maxRows={2}
                                style={{ width: '100%', padding: 8, fontFamily: 'monospace' }}
                                value={uniqueNames}
                                onChange={(e) => setUniqueNames(e.target.value)}
                            />
                            <Button variant="contained" size="small" sx={{ mt: 1 }} onClick={saveToFavourites}>
                                Update Favourites
                            </Button>
                        </Box>
                    )}
                </Box>
            </Collapse>
        </div>
    );
};
