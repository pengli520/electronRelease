import { createApp } from 'vue'
import 'ant-design-vue/dist/antd.css'
import App from './App.vue'
import router from './router'

import {
  Input,
  Tabs,
  TabPane,
  Button,
  List,
  ListItem,
  Card,
  CardMeta,
  Select,
  Row,
  Col,
  Avatar,
  Image,
  Modal,
  Tooltip,
  Progress,
  Spin
} from 'ant-design-vue'
const app = createApp(App)

app.use(Input).use(Tabs)
app.use(TabPane as any)
app.use(Input.Textarea)
app.use(Button)
app.use(List)
app.use(Card)
app.use(CardMeta as any)
app.use(Row)
app.use(Col)
app.use(Avatar)
app.use(ListItem as any)
app.use(Select)
app.use(Image)
app.use(Modal)
app.use(Tooltip)
app.use(Spin)
app.use(Progress)



app.use(router).mount('#app');


