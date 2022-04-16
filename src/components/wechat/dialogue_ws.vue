<template>
    <div class="dialogue">
        <header id="wx-header">
            <div class="center">
                <span>群聊{{pageName}}</span>
                <span class="parentheses"
                    v-show='$route.query.group_num&&$route.query.group_num!=1'>{{$route.query.group_num}}</span>
            </div>
        </header>
        <section class="dialogue-section clearfix" v-on:click="MenuOutsideClick">
            <div class="row clearfix" v-for="(item,index) in msgList" :key="index">
                <!--<img :src="'static/header03.jpeg'" class="header">-->
                <img src="@/assets/images/header/header03.jpeg" class="header">
                <p v-more>{{item.name}}</p>
                <p class="text" v-more>{{item.text}}</p>
            </div>
            <span class="msg-more" id="msg-more">
                <ul>
                    <li>复制</li>
                    <li>转发</li>
                    <li>收藏</li>
                    <li>删除</li>
                </ul>
            </span>
        </section>
        <footer class="dialogue-footer">
            <div class="component-dialogue-bar-person">
                <span class="iconfont icon-dialogue-jianpan" v-show="!currentChatWay"
                    v-on:click="currentChatWay=true"></span>
                <span class="iconfont icon-dialogue-voice" v-show="currentChatWay"
                    v-on:click="currentChatWay=false"></span>
                <div class="chat-way" v-show="!currentChatWay">
                    <div class="chat-say" v-press>
                        <span class="one">按住 说话</span>
                        <span class="two">松开 结束</span>
                    </div>
                </div>
                <div class="chat-way" v-show="currentChatWay">
                    <input class="chat-txt" type="text" v-on:focus="focusIpt" v-on:blur="blurIpt" ref="chatTxt"/>
                </div>
                <span class="expression iconfont icon-dialogue-smile" v-on:click="sendText"></span>
                <span class="more iconfont icon-dialogue-jia"></span>
                <div class="recording" style="display: none;" id="recording">
                    <div class="recording-voice" style="display: none;" id="recording-voice">
                        <div class="voice-inner">
                            <div class="voice-icon"></div>
                            <div class="voice-volume">
                                <span></span>
                                <span></span>
                                <span></span>
                                <span></span>
                                <span></span>
                                <span></span>
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                        </div>
                        <p>手指上划,取消发送</p>
                    </div>
                    <div class="recording-cancel" style="display: none;">
                        <div class="cancel-inner"></div>
                        <p>松开手指,取消发送</p>
                    </div>
                </div>
            </div>
        </footer>
    </div>
</template>
<script>
    export default {
        data() {
            return {
                pageName: this.$route.query.name,
                currentChatWay: true, // true为键盘打字 false为语音输入
                timer: null,
                authToken: this.$route.query.token,
                msgList: [{
                    text: "长按消息，唤醒消息操作菜单",
                    date: 1488117964495,
                    name: "夜华",
                    headerUrl: "https://sinacloud.net/vue-wechat/images/headers/yehua.jpg"
                }, {
                    text: '点击空白处，操作菜单消失',
                    date: 1488117964495,
                    name: "阿荡",
                    headerUrl: "https://sinacloud.net/vue-wechat/images/headers/header01.png"
                },
                {
                    text: '我试一试',
                    date: 1488117964495,
                    name: "夜华",
                    headerUrl: "https://sinacloud.net/vue-wechat/images/headers/yehua.jpg"
                }
                ]
                // sayActive: false // false 键盘打字 true 语音输入
            }
        },
        beforeRouteEnter(to, from, next) {
            next(vm => {
                vm.$store.commit("setPageName", vm.$route.query.name)
            })
        },
        computed: {
            msgInfo() {
                for (var i in this.$store.state.msgList.baseMsg) {
                    if (this.$store.state.msgList.baseMsg[i].mid == this.$route.query.mid) {
                        return this.$store.state.msgList.baseMsg[i]
                    }
                }
                return {}
            }
        },
        directives: {
            press: {
                inserted(element) {
                    var recording = document.querySelector('.recording'),
                        recordingVoice = document.querySelector('.recording-voice'),
                        recordingCancel = document.querySelector('.recording-cancel'),
                        // startTx,
                        startTy

                    element.addEventListener('touchstart', function (e) {
                        // 用bind时，vue还没插入到dom,故dom获取为 undefine，用 inserted 代替 bind,也可以开个0秒的定时器
                        element.className = "chat-say say-active"
                        recording.style.display = recordingVoice.style.display = "block"
                        var touches = e.touches[0]
                        // startTx = touches.clientX
                        startTy = touches.clientY
                        e.preventDefault()
                    }, false)
                    element.addEventListener('touchend', function (e) {
                        /*var touches = e.changedTouches[0];
                        var distanceY = startTy - touches.clientY;
                        if (distanceY > 50) {
                            console.log("取消发送信息");
                        }else{
                            console.log("发送信息");
                        }*/

                        element.className = "chat-say"
                        recordingCancel.style.display = recording.style.display = recordingVoice.style.display = "none"
                        e.preventDefault()
                    }, false)
                    element.addEventListener('touchmove', function (e) {
                        var touches = e.changedTouches[0],
                            // endTx = touches.clientX,
                            endTy = touches.clientY,
                            // distanceX = startTx - endTx,
                            distanceY = startTy - endTy;

                        if (distanceY > 50) {
                            element.className = "chat-say"
                            recordingVoice.style.display = "none"
                            recordingCancel.style.display = "block"
                        } else {
                            element.className = "chat-say say-active"
                            recordingVoice.style.display = "block"
                            recordingCancel.style.display = "none"
                        }
                        // 阻断事件冒泡 防止页面被一同向上滑动
                        e.preventDefault()
                    }, false);
                }
            },
            more: {
                bind(element) {
                    var startTx, startTy
                    element.addEventListener('touchstart', function (e) {
                        var msgMore = document.getElementById('msg-more'),
                            touches = e.touches[0];
                        startTx = touches.clientX
                        startTy = touches.clientY

                        clearTimeout(this.timer)
                        this.timer = setTimeout(() => {
                            // 控制菜单的位置
                            msgMore.style.left = ((startTx - 18) > 180 ? 180 : (startTx - 18)) + 'px'
                            msgMore.style.top = (element.offsetTop - 33) + 'px'
                            msgMore.style.display = "block"
                            element.style.backgroundColor = '#e5e5e5'
                        }, 500)

                    }, false)
                    element.addEventListener('touchmove', function (e) {
                        var touches = e.changedTouches[0],
                            disY = touches.clientY;
                        if (Math.abs(disY - startTy) > 10) {
                            clearTimeout(this.timer)
                        }
                    }, false)
                    element.addEventListener('touchend', function () {
                        clearTimeout(this.timer)
                    }, false)
                }
            }
        },
        methods: {
            // 解决输入法被激活时 底部输入框被遮住问题
            focusIpt() {
                this.timer = setInterval(function () {
                    document.body.scrollTop = document.body.scrollHeight
                }, 100)
            },
            blurIpt() {
                clearInterval(this.timer)
            },
            // 点击空白区域，菜单被隐藏
            MenuOutsideClick(e) {
                var container = document.querySelectorAll('.text'),
                    msgMore = document.getElementById('msg-more')
                if (e.target.className !== 'text') {
                    msgMore.style.display = 'none'
                    container.forEach(item => item.style.backgroundColor = '#fff')
                }
            },
            //发送消息
            sendText() {
                var chatTxt = this.$refs.chatTxt.value;
                console.info("chatText:" + chatTxt)

                var authToken = this.$route.query.token;
                console.info("authToken:" + authToken)

                console.info(this.msgList)
                var date = new Date();
                var time = date.getTime();
                //var milliseconds = date.getMilliseconds();
                this.msgList.push({
                    text: "自定义消息" + time,
                    date: 1488117964495,
                    name: "夜华222",
                    headerUrl: "https://sinacloud.net/vue-wechat/images/headers/yehua.jpg"
                })

                console.info(this.msgList)
                // 超过10条消息，将前面的消息清理掉
                if (this.msgList.length >= 10) {
                    this.msgList.shift();
                }
            }
        }
    }
</script>
<style lang="less">
    @import "../../assets/less/dialogue.less";

    .say-active {
        background: #c6c7ca;
    }
</style>