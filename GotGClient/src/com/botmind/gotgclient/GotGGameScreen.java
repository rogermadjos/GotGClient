package com.botmind.gotgclient;

import com.botmind.framework.Game;
import com.botmind.framework.Graphics;
import com.botmind.framework.Image;
import com.botmind.framework.Screen;

public class GotGGameScreen extends Screen {
	
	private Image bgImage;
	private Graphics graphics;

	public GotGGameScreen(Game game) {
		super(game);
		
		graphics = game.getGraphics();
		bgImage = graphics.newImage("background.png", com.botmind.framework.Graphics.ImageFormat.RGB565);
	}

	
	
	public void update(float deltaTime) {
	}

	public void paint(float deltaTime) {
		
		int numX = graphics.getWidth() / bgImage.getWidth() + 1;
		int numY = graphics.getHeight() / bgImage.getHeight() + 1;
		
		for (int i = 0; i < numX; i++) {
			for (int j = 0; j < numY; j++) {
				graphics.drawImage(bgImage, bgImage.getWidth() * i, bgImage.getHeight() * j);
			}
		}
		
		
	}

	public void pause() {
		
	}

	public void resume() {
	}

	public void dispose() {
		
	}

	public void backButton() {
		
	}

}
