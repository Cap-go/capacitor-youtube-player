package com.capgo.youtubeplayer;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicInteger;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;

public class RxBusTest {

    @Before
    @After
    public void resetBus() throws Exception {
        Field lastMessageField = RxBus.class.getDeclaredField("lastMessage");
        lastMessageField.setAccessible(true);
        lastMessageField.set(null, null);

        Field subscribersField = RxBus.class.getDeclaredField("subscribers");
        subscribersField.setAccessible(true);
        @SuppressWarnings("unchecked")
        List<?> subscribers = (List<?>) subscribersField.get(null);
        subscribers.clear();
    }

    @Test
    public void subscribe_receivesReplayBeforeLaterPublish() {
        RxBus.publish("A");
        List<String> received = new ArrayList<>();
        RxBus.subscribe((message) -> received.add((String) message));
        RxBus.publish("B");
        assertEquals(List.of("A", "B"), received);
    }

    @Test
    public void newSubscriber_receivesReplayThenSubsequentPublish() {
        RxBus.publish("seed");
        List<String> received = new ArrayList<>();
        RxBus.subscribe((message) -> received.add((String) message));
        assertEquals(List.of("seed"), received);
        RxBus.publish("live");
        assertEquals(List.of("seed", "live"), received);
    }

    @Test
    public void publishDuringReplayDelivery_staysOrderedAndSerialized() throws Exception {
        RxBus.publish("A");
        List<String> received = new ArrayList<>();
        CountDownLatch replayStarted = new CountDownLatch(1);
        CountDownLatch releaseReplay = new CountDownLatch(1);
        AtomicBoolean overlap = new AtomicBoolean(false);
        AtomicInteger inCallback = new AtomicInteger(0);

        Thread subscriberThread = new Thread(() ->
            RxBus.subscribe((message) -> {
                if ("A".equals(message)) {
                    replayStarted.countDown();
                    try {
                        assertTrue(releaseReplay.await(5, TimeUnit.SECONDS));
                    } catch (InterruptedException error) {
                        Thread.currentThread().interrupt();
                        throw new RuntimeException(error);
                    }
                }
                if (inCallback.incrementAndGet() > 1) {
                    overlap.set(true);
                }
                received.add((String) message);
                inCallback.decrementAndGet();
            })
        );
        subscriberThread.start();
        assertTrue(replayStarted.await(5, TimeUnit.SECONDS));

        RxBus.publish("B");
        releaseReplay.countDown();
        subscriberThread.join(5000);

        assertFalse("callbacks must not overlap", overlap.get());
        assertEquals(List.of("A", "B"), received);
    }

    @Test
    public void failingSubscriberIsDisposedWithoutAbortingOthers() {
        List<String> received = new ArrayList<>();
        RxBus.Subscription failing = RxBus.subscribe((message) -> {
            throw new RuntimeException("boom");
        });
        RxBus.subscribe((message) -> received.add((String) message));
        RxBus.publish("ok");
        assertEquals(List.of("ok"), received);
        assertTrue(failing.isDisposed());
    }
}
