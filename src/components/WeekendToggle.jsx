import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import { DISPATCH_ACTION } from '../utils/constants';
import "./WeekendToggle.css";

export const WeekendToggle = ({ dispatch, showWeekends }) => {
    const handleToggle = () => {
        dispatch({ type: DISPATCH_ACTION.TOGGLE_WEEKENDS });
    };

    return (
        <div className="weekend-toggle">
            <Box display="flex" justifyContent="space-between" alignItems="center" py={1}>
                <Typography variant="h6" component="h3">
                    Weekends
                </Typography>
                <FormControlLabel
                    control={
                        <Switch
                            checked={showWeekends}
                            onChange={handleToggle}
                            size="small"
                        />
                    }
                    label={showWeekends ? "Show" : "Hide"}
                    labelPlacement="start"
                />
            </Box>
        </div>
    );
};
