<template>
    <div class="hello">
        <h1>Общий чат</h1>

        <p>
            <strong>Всего подключений:</strong> {{ stats.total_connections }}
        </p>

        <form @submit.prevent="onMessageSubmit">
            <input type="text" v-model="message" required>
            <button type="submit">Отправить</button>
        </form>

        <ul style="display: inline-grid;">
            <li v-for="(item, index) in chat" :key="index">
                <p>
                    <strong>Username:</strong> {{ item.author_name }}
                </p>
                <p>
                    <strong>Email:</strong> {{ item.author_email }}
                </p>
                <p>
                    <strong>CreatedAt:</strong> {{ item.created_at }}
                </p>
                <p>
                    <strong>Message:</strong> {{ item.message }}
                </p>
                <div>
                    <template v-if="item.is_answered">
                        <p>
                            <strong>Мой ответ:</strong> {{ item.answer }}
                        </p>
                    </template>
                    <template v-else>
                        <form @submit.prevent="onAnswerSubmit(item)">
                            <input type="text" v-model="item.answer" required>
                            <button type="submit">Ответить в ЛС</button>
                        </form>
                    </template>
                </div>
                <hr />
            </li>
        </ul>
    </div>
</template>

<script>
export default {
    name: 'ChatGeneral',
    data() {
        return {
            stats: {
                total_connections: 0,
            },
            message: null,
            chat: [],
        }
    },
    mounted() {
        setInterval(() => {
            this.$socket.emit('general_chat-check_stats');
        }, 1000);

        this.$socket.on('general_chat-history', (response) => {
            this.chat = response;
        });

        this.$socket.on('general_chat-new_stats', (response) => {
            this.stats = response;
        });

        this.$socket.on('general_chat-message_is_stored', (response) => {
            this.chat.unshift(response);
        });

        this.$socket.on('private_chat-message_is_stored', (response) => {
            this.chat.unshift(response);
        });
    },
    methods: {
        onMessageSubmit() {
            this.$socket.emit('general_chat-new_message', this.message);
            this.message = null;
        },
        onAnswerSubmit(item) {
            this.$socket.emit('private_chat-new_message', {
                message: item.answer,
                connection_id: item.connection_id,
            });
            item.is_answered = true;
        },
    },
}
</script>

<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
</style>
