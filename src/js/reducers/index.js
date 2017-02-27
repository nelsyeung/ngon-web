import { combineReducers } from 'redux';
import polygons from './polygons';
import ui from './ui';

export default combineReducers({
  polygons,
  ui,
});
