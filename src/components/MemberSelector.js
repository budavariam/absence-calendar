import * as React from 'react';
import "./MemberSelector.css"
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import { DISPATCH_ACTION } from '../utils/constants';

export function MemberSelector({ members, selectedMembers, dispatch }) {
    const [checked, setChecked] = React.useState([0]);

    const handleToggle = (value) => () => {
        dispatch({ type: DISPATCH_ACTION.CHECK_MEMBER, value: value })
    };

    const [name, setName] = React.useState('');
    const handleChange = (event) => {
        setName(event.target.value);
    };

    return (
        <div className='memberSelector'>
            <TextField
                id="member-filter"
                label="Filter Members"
                variant="standard"
                value={name}
                onChange={handleChange}
            />
            <List sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
                {members.filter((member) => {
                    if (name.length <= 3) {
                        // do not change selection under 3 letters
                        return true
                    }
                    return member.toLocaleLowerCase().indexOf(name.toLocaleLowerCase()) > -1
                }).map((value) => {
                    const labelId = `checkbox-list-label-${value}`;
                    return (
                        <ListItem
                            key={value}
                            secondaryAction={
                                <IconButton edge="end" aria-label="comments">
                                </IconButton>
                            }
                            disablePadding
                        >
                            <ListItemButton role={undefined} onClick={handleToggle(value)} dense>
                                <ListItemIcon>
                                    <Checkbox
                                        edge="start"
                                        checked={selectedMembers.has(value)}
                                        tabIndex={-1}
                                        disableRipple
                                        inputProps={{ 'aria-labelledby': labelId }}
                                    />
                                </ListItemIcon>
                                <ListItemText id={labelId} primary={value} />
                            </ListItemButton>
                        </ListItem>
                    );
                })}
            </List>
        </div>
    );
}
