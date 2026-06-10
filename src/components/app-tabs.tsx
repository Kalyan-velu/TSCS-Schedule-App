import {NativeTabs} from 'expo-router/unstable-native-tabs';
import {useColorScheme} from 'react-native';

import {Colors} from '@/constants/theme';

export default function AppTabs() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];
  
  return (
    <NativeTabs
      backgroundColor={colors.background}
      indicatorColor={colors.backgroundElement}
      labelStyle={{selected: {color: colors.text}}}>
      
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{default: 'house', selected: 'house.fill'}}
          md={{default: 'home', selected: 'home_filled'}}
        />
      </NativeTabs.Trigger>
      
      <NativeTabs.Trigger name="schedule">
        <NativeTabs.Trigger.Label>Schedule</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{default: 'calendar', selected: 'calendar'}}
          md="calendar_month"
        />
      </NativeTabs.Trigger>
      
      {/*<NativeTabs.Trigger name="material">*/}
      {/*  <NativeTabs.Trigger.Label>Material</NativeTabs.Trigger.Label>*/}
      {/*  <NativeTabs.Trigger.Icon*/}
      {/*    sf={{ default: 'book', selected: 'book.fill' }}*/}
      {/*    md={{ default: 'menu_book', selected: 'menu_book' }}*/}
      {/*  />*/}
      {/*</NativeTabs.Trigger>*/}
      
      <NativeTabs.Trigger name="profile">
        <NativeTabs.Trigger.Label>Profile</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{default: 'person', selected: 'person.fill'}}
          md={{default: 'person_outline', selected: 'person'}}
        />
      </NativeTabs.Trigger>
    
    </NativeTabs>
  );
}
