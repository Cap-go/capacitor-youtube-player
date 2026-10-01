package com.capgo.youtubeplayer;

import androidx.annotation.NonNull;
import java.util.ArrayList;
import java.util.List;
import java.util.function.Consumer;

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
        Object replay;
        synchronized (lock) {
            registration = new Registration(action);
            subscribers.add(registration);
            replay = lastMessage;
            if (replay == null) {
                return registration;
            }
        }
        action.accept(replay);
        return registration;
    }

    public static void publish(@NonNull Object message) {
        List<Consumer<Object>> targets = new ArrayList<>();
        synchronized (lock) {
            lastMessage = message;
            for (Registration registration : subscribers) {
                if (!registration.disposed) {
                    targets.add(registration.action);
                }
            }
        }
        for (Consumer<Object> target : targets) {
            target.accept(message);
        }
    }

    private static final class Registration implements Subscription {

        private final Consumer<Object> action;
        private volatile boolean disposed;

        Registration(Consumer<Object> action) {
            this.action = action;
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
        }

        @Override
        public boolean isDisposed() {
            return disposed;
        }
    }
}
