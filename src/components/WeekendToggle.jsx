import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import { DISPATCH_ACTION } from '../utils/constants';

export const WeekendToggle = ({ dispatch, showWeekends }) => {
    return (
        <FormControlLabel
            sx={{ mt: 1, ml: 0 }}
            control={
                <Switch
                    checked={showWeekends}
                    onChange={() => dispatch({ type: DISPATCH_ACTION.TOGGLE_WEEKENDS })}
                    size="small"
                />
            }
            label={
                <Typography variant="body2">
                    {showWeekends ? 'Show weekends' : 'Hide weekends'}
                </Typography>
            }
        />
    );
};
