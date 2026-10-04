package com.capgo.youtubeplayer;

import androidx.annotation.NonNull;
import androidx.core.util.Consumer;
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Deque;
import java.util.List;

/** BehaviorSubject-style event bus: replays the last value to new subscribers on the subscribing thread. */
public final class RxBus {

    private static final Object lock = new Object();
    private static Object lastMessage;
    private static final List<Registration> subscribers = new ArrayList<>();

    private RxBus() {}

    public interface Subscription {
        void dispose();

        boolean isDisposed();
    }

    public static Subscription subscribe(@NonNull Consumer<Object> action) {
        Registration registration;
        synchronized (lock) {
            registration = new Registration(action);
            subscribers.add(registration);
            if (lastMessage != null) {
                registration.enqueue(lastMessage);
            }
        }
        registration.scheduleDrain();
        return registration;
    }

    public static void publish(@NonNull Object message) {
        List<Registration> targets;
        synchronized (lock) {
            lastMessage = message;
            targets = new ArrayList<>(subscribers);
            for (Registration registration : targets) {
                registration.enqueue(message);
            }
        }
        for (Registration registration : targets) {
            registration.scheduleDrain();
        }
    }

    private static final class Registration implements Subscription {

        private final Consumer<Object> action;
        private final Deque<Object> pending = new ArrayDeque<>();
        private final Object deliveryLock = new Object();
        private volatile boolean disposed;
        private boolean draining;

        Registration(Consumer<Object> action) {
            this.action = action;
        }

        void enqueue(Object message) {
            synchronized (deliveryLock) {
                if (disposed) {
                    return;
                }
                pending.addLast(message);
            }
        }

        void scheduleDrain() {
            synchronized (deliveryLock) {
                if (disposed || draining) {
                    return;
                }
                draining = true;
            }
            drainLoop();
        }

        private void drainLoop() {
            while (true) {
                Object message;
                synchronized (deliveryLock) {
                    if (disposed) {
                        pending.clear();
                        draining = false;
                        return;
                    }
                    message = pending.pollFirst();
                    if (message == null) {
                        draining = false;
                        return;
                    }
                }
                if (disposed) {
                    continue;
                }
                try {
                    action.accept(message);
                } catch (RuntimeException error) {
                    dispose();
                } catch (Error error) {
                    dispose();
                    throw error;
                }
            }
        }

        @Override
        public void dispose() {
            if (disposed) {
                return;
            }
            synchronized (lock) {
                if (disposed) {
                    return;
                }
                disposed = true;
                subscribers.remove(this);
            }
            synchronized (deliveryLock) {
                pending.clear();
            }
        }

        @Override
        public boolean isDisposed() {
            return disposed;
        }
    }
}
