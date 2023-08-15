/* eslint-disable prettier/prettier */
import List from '@mui/material/List';
import SettingItem from './SettingItem';
import { PORT } from '../utils/stringKeys';

function AppConfig() {

  return (
      <List className=''>
      <SettingItem key={PORT} description='The port for the running server. Do not edit this'
      name={PORT}
       type="input" />

    </List>
  )
}

export default AppConfig
